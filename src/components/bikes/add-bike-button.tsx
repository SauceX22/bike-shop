"use client";

import { Button, buttonVariants } from "@/components/ui/button";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { revalidatePathCache } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { addNewBikeSchema } from "@/lib/validations/general";
import { api } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SketchPicker } from "react-color";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

type FormData = z.infer<typeof addNewBikeSchema>;

export default function AddBikeButton() {
  const addBikeForm = useForm<FormData>({
    resolver: zodResolver(addNewBikeSchema),
    defaultValues: {
      name: "",
      model: "",
      location: "",
      color: "#fff",
      available: true,
    },
  });
  const {
    handleSubmit,
    formState: { errors },
  } = addBikeForm;

  const [showDialog, setShowDialog] = useState(false);
  const path = usePathname();
  const apiUtils = api.useUtils();

  const { mutateAsync: addBike, isLoading } = api.bike.createBike.useMutation({
    onError(err) {
      toast.error("Something went wrong.", {
        description: err.message,
      });
    },
    async onSuccess(data, variables, context) {
      setShowDialog(false);
      addBikeForm.reset();

      toast.success("Bike added successfully!", {
        description: "The bike has been successfully added to the shop.",
      });

      await apiUtils.bike.invalidate();
      await revalidatePathCache(path);
    },
  });

  async function onSubmit(data: FormData) {
    await addBike(data);
  }

  return (
    <Dialog
      open={showDialog}
      onOpenChange={(isOpen) => {
        setShowDialog(isOpen);
        if (!isOpen) {
          addBikeForm.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Bike
        </Button>
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
              name="color"
              render={({ field }) => (
                <FormItem className="mt-2 flex flex-col">
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
            <DialogFooter className="mt-4">
              <Button type="submit">Add</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
