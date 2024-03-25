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
import { CalendarIcon, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

type FormData = z.infer<typeof filterFormSchema>;

const FilterHeader = () => {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("query");

  const filterForm = useForm<FormData>({
    resolver: zodResolver(filterFormSchema),
    defaultValues: {
      query: urlQuery ?? undefined,
      queryType: "all",
      doa: undefined,
    },
  });

  async function onSubmit(data: FormData) {
    await searchAction({
      query: data.query,
      queryType: data.queryType,
      doa: data.doa,
    });
    toast.info('Search results for "' + data.query + '"', {
      description: "Search results are displayed below",
      duration: 1000,
    });
  }

  return (
    <Form {...filterForm}>
      <form
        onSubmit={filterForm.handleSubmit(onSubmit)}
        className="w-full grid gap-2 grid-cols-6 grid-rows-1"
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
            <Select {...field}>
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
            <FormItem className="flex flex-col col-span-2">
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "pl-3 text-left font-normal w-full",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {field.value ? (
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
                    selected={field.value}
                    onSelect={(dateRange) => {
                      console.log(dateRange);
                      if (!dateRange?.from) return;
                      filterForm.setValue("doa", {
                        from: dateRange.from,
                        to: dateRange.to ?? dateRange.from,
                      });
                    }}
                    className="rounded-md border flex-shrink-0"
                    footer={
                      <Button
                        variant="outline"
                        className="text-muted-foreground text-sm text-center w-full mt-2"
                        onClick={() => {
                          filterForm.setValue("doa", undefined);
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
        <Button className="col-span-1">
          <Search className="h-4 w-4" />
          Search
        </Button>
      </form>
    </Form>
  );
};

export default FilterHeader;
