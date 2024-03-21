"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { addNewBikeSchema } from "@/lib/validations/bike";
import { api } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

type FormData = z.infer<typeof addNewBikeSchema>;

export default function AddBikeButton() {
  const addBikeForm = useForm<FormData>({
    resolver: zodResolver(addNewBikeSchema),
  });
  const {
    handleSubmit,
    formState: { errors },
  } = addBikeForm;

  const [showDialog, setShowDialog] = useState(false);
  const router = useRouter();

  const apiUtils = api.useUtils();

  const { mutateAsync: addBike, isLoading } = api.bike.createBike.useMutation({
    onError(err) {
      toast.error("Something went wrong.", {
        description: err.message,
      });
    },
    async onSuccess(data, variables, context) {
      setShowDialog(false);
      toast.success("Bike added successfully!", {
        description: "The bike has been successfully added to the shop.",
      });

      await apiUtils.bike.invalidate();
      router.refresh();
    },
  });

  async function onSubmit(data: FormData) {
    await addBike(data);
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button>Add Bike</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Bike</DialogTitle>
          <DialogDescription>
            Enter the bike&apos;s information to add it to the shop.
          </DialogDescription>
        </DialogHeader>
        <Form {...addBikeForm}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormField
              control={addBikeForm.control}
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
              control={addBikeForm.control}
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
              control={addBikeForm.control}
              name="color"
              render={({ field }) => (
                <FormItem className="mt-2">
                  <FormLabel htmlFor="color">Color</FormLabel>
                  <FormControl id="color">
                    <Input
                      type="text"
                      id="color"
                      autoCapitalize="words"
                      autoComplete="color"
                      autoCorrect="off"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage>{errors.color?.message}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={addBikeForm.control}
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
            <FormField
              control={addBikeForm.control}
              name="available"
              render={({ field }) => (
                <FormItem className="mt-2">
                  <FormLabel htmlFor="available">Available for Rent</FormLabel>
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
            <DialogFooter>
              <Button type="submit">Add</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
