"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { searchAction } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { filterFormSchema } from "@/lib/validations/general";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { debounce } from "lodash";
import { CalendarIcon, Search, SearchX } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

type FormData = z.infer<typeof filterFormSchema>;

const FilterHeader = () => {
  const searchParams = useSearchParams();
  const path = usePathname();

  const querySP = searchParams.get("query");
  const validatedQueryTypeSP = filterFormSchema.shape.queryType.safeParse(
    searchParams.get("queryType"),
  );
  const queryTypeSP = validatedQueryTypeSP.success
    ? validatedQueryTypeSP.data
    : "all";
  const doaFromSP = searchParams.get("doaFrom");
  const doaToSP = searchParams.get("doaTo");

  const filterForm = useForm<FormData>({
    resolver: zodResolver(filterFormSchema),
    defaultValues: {
      query: querySP ?? undefined,
      queryType: queryTypeSP,
      doa: {
        from: doaFromSP ? new Date(doaFromSP) : undefined,
        to: doaToSP ? new Date(doaToSP) : undefined,
      },
    },
    mode: "onChange",
  });

  const debounceSubmit = useCallback(
    debounce(async () => {
      await filterForm.handleSubmit(onSubmit)();
    }, 500),
    [],
  );

  async function onSubmit(data: FormData) {
    await searchAction(
      {
        query: data.query,
        queryType: data.queryType,
        doa: data.doa,
      },
      path,
    );

    // if notion is used, replace with notion toast
    if (!data.query && !data.doa?.from && !data.doa?.to) {
      return toast.info("Showing all bikes", {
        description: "All bikes are displayed below",
        duration: 1000,
      });
    }

    // if all
    if (data.query && data.doa?.from && data.doa?.to) {
      return toast.info("Showing search results", {
        description: JSON.stringify({
          ...data,
          doa: {
            from: format(data.doa.from, "PPP"),
            to: format(data.doa.to, "PPP"),
          },
        }),
        icon: "🔍",
        duration: 2500,
      });
    }

    if (data.query) {
      return toast.info("Showing search results", {
        description: `Showing bikes with ${data.queryType} containing ${data.query}`,
        icon: "🔍",
        duration: 2500,
      });
    }

    if (data.doa?.from && data.doa?.to) {
      return toast.info("Showing search results", {
        description: `Showing bikes available from ${format(
          data.doa.from,
          "PPP",
        )} to ${format(data.doa.to, "PPP")}`,
        icon: "🔍",
        duration: 2500,
      });
    }
  }

  return (
    <Form {...filterForm}>
      <form
        className="w-full grid gap-2 grid-cols-8 grid-rows-1"
        onSubmit={filterForm.handleSubmit(onSubmit)}
        onChange={debounceSubmit}
        onKeyDown={async (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            await filterForm.handleSubmit(onSubmit)();
          }
        }}
      >
        <div className="relative col-span-2">
          <FormField
            control={filterForm.control}
            name="query"
            render={({ field }) => (
              <>
                <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  {...field}
                  type="search"
                  className="pl-8"
                  placeholder="Search"
                />
              </>
            )}
          />
        </div>
        <FormField
          control={filterForm.control}
          name="queryType"
          render={({ field }) => (
            <Select
              {...field}
              onValueChange={(value) => {
                const validatedValue =
                  filterFormSchema.shape.queryType.safeParse(value);
                if (!validatedValue.success) return;
                filterForm.setValue("queryType", validatedValue.data);
              }}
              value={field.value}
            >
              <SelectTrigger>
                <SelectValue placeholder="Search by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="model">Model</SelectItem>
                <SelectItem value="location">Location</SelectItem>
                <SelectItem value="ratingAvg">Rate Average</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        <FormField
          control={filterForm.control}
          name="doa"
          render={({ field }) => (
            <FormItem className="flex flex-col col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "pl-3 text-left font-normal w-full",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {field.value?.from && field.value?.to ? (
                        <span>
                          <span className="underline">
                            {format(field.value.from, "PPP")}
                          </span>
                          {!!field.value.to && " to "}
                          <span className="underline">
                            {field.value.to && format(field.value.to, "PPP")}
                          </span>
                        </span>
                      ) : (
                        <span>Pick a date of availability</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    {...field}
                    mode="range"
                    selected={{
                      from: field.value?.from,
                      to: field.value?.to,
                    }}
                    onSelect={(dateRange) => {
                      if (!dateRange?.from) return;
                      filterForm.setValue("doa", {
                        from: dateRange.from,
                        to: dateRange.to ?? dateRange.from,
                      });
                    }}
                    onDayClick={async (date) => await debounceSubmit()}
                    className="rounded-md border flex-shrink-0"
                    footer={
                      <Button
                        variant="outline"
                        className="text-muted-foreground text-sm text-center w-full mt-2"
                        onClick={(e) => {
                          e.preventDefault();
                          filterForm.setValue("doa", {
                            from: undefined,
                            to: undefined,
                          });
                        }}
                      >
                        clear
                      </Button>
                    }
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          variant="outline"
          className="col-span-1"
          onClick={async (e) => {
            e.preventDefault();
            filterForm.reset({
              query: "",
              queryType: "all",
              doa: {
                from: undefined,
                to: undefined,
              },
            });
            await searchAction(
              {
                query: "",
                queryType: "all",
                doa: {
                  from: undefined,
                  to: undefined,
                },
              },
              path,
            );
          }}
        >
          <SearchX className="h-4 w-4 mr-2" />
          Clear
        </Button>
        <Button className="col-span-1" type="submit">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </form>
    </Form>
  );
};

export default FilterHeader;
