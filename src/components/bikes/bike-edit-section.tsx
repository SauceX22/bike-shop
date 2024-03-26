"use client";

import DeleteBikeButton from "@/components/delete-bike-button";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { revalidatePathCache } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { updateBikeSchema } from "@/lib/validations/general";
import { api } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Bike } from "@prisma/client";
import { useRouter } from "next/navigation";
import React from "react";
import { SketchPicker } from "react-color";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

type Props = {
  bike: Bike;
} & React.HTMLAttributes<HTMLDivElement>;

type FormData = z.infer<typeof updateBikeSchema>;

const BikeEditSection = ({ bike, className }: Props) => {
  const updateBikeForm = useForm<FormData>({
    resolver: zodResolver(updateBikeSchema),
    defaultValues: {
      name: bike.name,
      model: bike.model,
      location: bike.location,
      color: bike.color,
      available: bike.available,
    },
  });
  const {
    handleSubmit,
    formState: { errors },
  } = updateBikeForm;

  const apiUtils = api.useUtils();
  const router = useRouter();

  const { mutateAsync: updateBike, isLoading } =
    api.bike.updateBike.useMutation({
      onError: (error) => {
        toast.error("Something went wrong.", {
          description: error.message,
        });
      },
      onSuccess: async () => {
        toast.success("Bike updated successfully!", {
          description: "Updated bike info is now visible to users.",
        });

        await apiUtils.bike.invalidate();
        await revalidatePathCache("/bikes");
        router.push("/bikes");
      },
    });

  const onSubmit = async (data: FormData) => {
    await updateBike({ id: bike.id, ...data });
  };

  return (
    <div className={cn("flex gap-2 w-full", className)}>
      <Card className="w-full flex flex-col">
        <Form {...updateBikeForm}>
          <form>
            <CardHeader>
              <CardTitle>Bike Details</CardTitle>
              <CardDescription>
                {bike?.name} - {bike?.model}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={updateBikeForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="mt-2">
                    <FormLabel htmlFor="name">Name</FormLabel>
                    <FormControl id="name">
                      <Input
                        type="text"
                        id="name"
                        autoCapitalize="words"
                        autoComplete="name"
                        autoCorrect="off"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage>{errors.name?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={updateBikeForm.control}
                name="model"
                render={({ field }) => (
                  <FormItem className="mt-2">
                    <FormLabel htmlFor="model">Model</FormLabel>
                    <FormControl id="model">
                      <Input
                        type="text"
                        id="model"
                        autoCapitalize="words"
                        autoComplete="model"
                        autoCorrect="off"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage>{errors.model?.message}</FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                control={updateBikeForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem className="mt-2">
                    <FormLabel htmlFor="location">Location</FormLabel>
                    <FormControl id="location">
                      <Input
                        type="text"
                        id="location"
                        autoCapitalize="words"
                        autoComplete="location"
                        autoCorrect="off"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage>{errors.location?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-between gap-4 w-full">
                <FormField
                  control={updateBikeForm.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem className="w-full mt-2 flex flex-col">
                      <FormLabel htmlFor="color">Color</FormLabel>
                      <FormControl id="color">
                        <Popover>
                          <PopoverTrigger
                            className={cn(buttonVariants(), "w-full")}
                            style={{ backgroundColor: field.value }}
                          >
                            Open Color Picker
                          </PopoverTrigger>
                          <PopoverContent>
                            <SketchPicker
                              key="color-picker"
                              color={field.value}
                              onChangeComplete={(color) =>
                                field.onChange(color.hex)
                              }
                            />
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage>{errors.color?.message}</FormMessage>
                    </FormItem>
                  )}
                />
                <FormField
                  control={updateBikeForm.control}
                  name="available"
                  render={({ field }) => (
                    <FormItem className="w-full mt-2 gap-2 flex flex-col">
                      <FormLabel htmlFor="available">
                        Available for Rent
                      </FormLabel>
                      <FormControl id="available">
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          defaultChecked={true}
                        />
                      </FormControl>
                      <FormMessage>{errors.available?.message}</FormMessage>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </form>
        </Form>
        <CardFooter className="mt-auto flex flex-col gap-4">
          <Button
            onClick={updateBikeForm.handleSubmit(onSubmit)}
            disabled={isLoading}
            className="w-full"
            size="default"
          >
            Update Bike Info
          </Button>
          <DeleteBikeButton bike={bike} />
        </CardFooter>
      </Card>
    </div>
  );
};

export default BikeEditSection;
