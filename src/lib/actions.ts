"use server";
import { filterFormSchema } from "@/lib/validations/general";
import { revalidatePath } from "next/cache";

import { redirect } from "next/navigation";
import { z } from "zod";

export async function searchAction(data: z.infer<typeof filterFormSchema>) {
  let url = "/bikes";

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
