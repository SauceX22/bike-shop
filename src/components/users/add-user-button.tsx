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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { addNewUserSchema } from "@/lib/validations/auth";
import { api } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

type FormData = z.infer<typeof addNewUserSchema>;

export default function AddUserButton() {
  const addUserForm = useForm<FormData>({
    resolver: zodResolver(addNewUserSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "USER",
      enabled: true,
    },
  });
  const {
    handleSubmit,
    formState: { errors },
  } = addUserForm;

  const [showDialog, setShowDialog] = useState(false);
  const router = useRouter();

  const apiUtils = api.useUtils();

  const { mutateAsync: addUser, isLoading } = api.user.addUser.useMutation({
    onError(err) {
      toast.error("Something went wrong.", {
        description: err.message,
      });
    },
    async onSuccess(data, variables, context) {
      toast.success("User addd!", {
        description: "The user has been successfully registered.",
      });

      await apiUtils.user.invalidate();
      router.refresh();
      setShowDialog(false);
    },
  });

  async function onSubmit(data: FormData) {
    await addUser({
      name: data.name,
      email: data.email,
      role: data.role,
      enabled: data.enabled,
    });
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
          <DialogDescription>
            Enter the user&apos;s information to add their account.
          </DialogDescription>
          <DialogDescription className="text-red-400/90">
            Note: The user will have to sign up as usual to complete the
            registration, however the account will be created with the provided
            information & privileges.
          </DialogDescription>
        </DialogHeader>
        <Form {...addUserForm}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-2 grid-rows-4 gap-2"
          >
            <FormField
              control={addUserForm.control}
              name="name"
              render={({ field }) => (
                <FormItem className="row-span-2">
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
                  <FormDescription className="row-span-1">
                    This name is temporary and will be immediately overwritten
                    once the user signs up for the first time.
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={addUserForm.control}
              name="email"
              render={({ field }) => (
                <FormItem className="row-span-2">
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <FormControl id="email">
                    <Input
                      type="email"
                      id="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage>{errors.email?.message}</FormMessage>
                  <FormDescription className="row-span-1">
                    This email is permanent and cannot be changed. It will be
                    used to sign up/in to the system.
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={addUserForm.control}
              name="role"
              render={({ field }) => (
                <FormItem className="row-span-2">
                  <FormLabel htmlFor="role">Role</FormLabel>
                  <FormControl id="role">
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>User Role</SelectLabel>
                          <SelectItem value="USER">User</SelectItem>
                          <SelectItem value="MANAGER">Manager</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage>{errors.role?.message}</FormMessage>
                  <FormDescription className="row-span-1">
                    User roles determine access: Managers can modify bikes,
                    users, and reservations but cannot rent bikes. Users can
                    reserve bikes and view their reservations.
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={addUserForm.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="w-full gap-2 flex flex-col row-span-2 justify-start">
                  <FormLabel htmlFor="enabled">Enabled for Access</FormLabel>
                  <FormControl id="enabled">
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage>{errors.enabled?.message}</FormMessage>
                  <FormDescription className="row-span-1">
                    If the user is not enabled, they will not be able to sign
                    into the system. This is useful for users who have been
                    banned or are no longer allowed to access the site.
                  </FormDescription>
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
