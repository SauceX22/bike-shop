"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/trpc/client";
import { type Bike } from "@prisma/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Props = {
  bike: Bike;
};

const DeleteBikeButton = ({ bike }: Props) => {
  const apiUtils = api.useUtils();
  const router = useRouter();

  const { mutateAsync: deleteBike } = api.bike.deleteBike.useMutation({
    onError(err) {
      toast.error("Something went wrong.", {
        description: err.message,
      });
    },
    async onSuccess(data, variables, context) {
      toast.success("Bike deleted", {
        description: `Bike with *${bike.name}* deleted successfully.`,
      });
      await apiUtils.bike.invalidate();
      router.refresh();
    },
  });

  return (
    <Button
      onClick={async () => await deleteBike({ id: bike.id })}
      variant="destructive"
      className="w-full"
    >
      delete
    </Button>
  );
};

export default DeleteBikeButton;
