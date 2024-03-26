"use server";
import { filterFormSchema } from "@/lib/validations/general";
import { db, WhereType } from "@/server/db";
import { areIntervalsOverlapping, isValid } from "date-fns";
import { isNumber } from "lodash";
import { revalidatePath } from "next/cache";

import { redirect } from "next/navigation";
import { z } from "zod";

export async function searchAction(
  data: z.infer<typeof filterFormSchema>,
  callbackUrl?: string,
) {
  let url = callbackUrl ?? "/bikes";

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

export async function revalidatePathCache(path: string) {
  return revalidatePath(path);
}

export const getFilteredBikes = async (
  searchParams: {
    query?: string;
    queryType?: string;
    doaFrom?: string;
    doaTo?: string;
  },
  { availableOnly = true },
) => {
  "use server";

  const query = searchParams.query;
  const queryType = searchParams.queryType;
  const queryDoaFrom = searchParams.doaFrom;
  const queryDoaTo = searchParams.doaTo;

  function queryObject(query?: string, queryType?: string): WhereType<"Bike"> {
    if (!query) return {};
    return {
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
        (queryType === "all" || queryType === "ratingAvg") && isNumber(query)
          ? {
              averageRating: {
                equals: parseFloat(query),
              },
            }
          : {},
      ],
    };
  }

  const queryWhereInput = queryObject(query, queryType);
  // search any property of the bike if queryType is all
  // otherwise search the specific property
  const bikes = await db.bike.findMany({
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      reservations: true,
    },
    where: {
      available: availableOnly ? true : undefined,
      ...queryWhereInput,
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
