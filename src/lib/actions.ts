"use server";
import { filterFormSchema } from "@/lib/validations/general";
import { db } from "@/server/db";
import { areIntervalsOverlapping, isValid } from "date-fns";
import { isNumber } from "lodash";
import { revalidatePath } from "next/cache";

import { redirect } from "next/navigation";
import { z } from "zod";

/**
 * Search server action to redirect to the callback url with the search params
 *
 * read more about server actions here: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
 *
 * @param data The form data to be submitted
 * @param callbackUrl The url to redirect to after the search
 * @returns void
 */
export async function searchAction(
  data: z.infer<typeof filterFormSchema>,
  callbackUrl: string,
) {
  let url = callbackUrl;

  if (data.query) {
    if (data.queryType) {
      url += `?query=${data.query}&queryType=${data.queryType}`;
    } else {
      url += `?query=${data.query}&queryType=all`;
    }
  }

  if (data.doa?.from && data.doa?.to) {
    url += `${data.query ? "&" : "?"}doaFrom=${data.doa.from.toISOString()}&doaTo=${data.doa.to.toISOString()}`;
  }
  return redirect(url);
}

/**
 * Server action to revalidate the cache of a path after a relevant mutation
 *
 * @param path path to revalidate the cache of
 * @returns void
 */
export async function revalidatePathCache(path: string) {
  return revalidatePath(path);
}

/**
 * Get filtered bikes based on the search parameters
 *
 * @param searchParams Search parameters used to filter the bikes
 * @param availableOnly Whether to only return available bikes
 * @returns The filtered bikes after query
 */
export const getFilteredBikes = async (
  searchParams: {
    query?: string;
    queryType?: string;
    doaFrom?: string;
    doaTo?: string;
  },
  { availableOnly = true },
) => {
  const query = searchParams.query;
  const queryType = searchParams.queryType;
  const queryDoaFrom = searchParams.doaFrom;
  const queryDoaTo = searchParams.doaTo;

  const queryObject = (query?: string, queryType?: string) => {
    if (!query) return {};
    if (queryType === "all") {
      return {
        OR: [
          {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            model: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            location: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            averageRating: {
              equals: parseFloat(query),
            },
          },
        ],
      };
    } else if (queryType) {
      return {
        [queryType]: {
          contains: query,
          mode: "insensitive",
        },
      };
    } else {
      return {};
    }
  };

  // search any property of the bike if queryType is all
  // otherwise search the specific property
  const bikes = await db.bike.findMany({
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      reservations: true,
    },
    where: query
      ? {
          available: availableOnly ? true : undefined,
          OR: [
            queryType === "all" || queryType === "name"
              ? {
                  name: {
                    contains: query,
                    mode: "insensitive",
                  },
                }
              : {},
            queryType === "all" || queryType === "model"
              ? {
                  model: {
                    contains: query,
                    mode: "insensitive",
                  },
                }
              : {},
            queryType === "all" || queryType === "location"
              ? {
                  location: {
                    contains: query,
                    mode: "insensitive",
                  },
                }
              : {},
            (queryType === "all" || queryType === "ratingAvg") &&
            isNumber(query)
              ? {
                  averageRating: {
                    equals: parseFloat(query),
                  },
                }
              : {},
          ],
        }
      : {
          available: availableOnly ? true : undefined,
        },
  });

  const isFilteringByDate =
    queryDoaFrom &&
    queryDoaTo &&
    isValid(new Date(queryDoaFrom)) &&
    isValid(new Date(queryDoaTo))
      ? true
      : false;

  console.log("isFilteringByDate", isFilteringByDate);

  const filteredBikes =
    isFilteringByDate && queryDoaFrom && queryDoaTo
      ? bikes.filter((bike) => {
          // filter by date of availability
          if (bike.reservations.length > 0) {
            const dateRangesNotAvailable = bike.reservations.map((resrv) => ({
              from: resrv.startDate,
              to: resrv.endDate,
            }));

            for (const dateRange of dateRangesNotAvailable) {
              // has to be available on the start, end and all in between days
              if (
                areIntervalsOverlapping(
                  {
                    start: queryDoaFrom,
                    end: queryDoaTo,
                  },
                  {
                    start: dateRange.from,
                    end: dateRange.to,
                  },
                  { inclusive: true },
                )
              ) {
                return false;
              }
            }
          }
          return true;
        })
      : bikes;

  return filteredBikes;
};
