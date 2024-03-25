"use server";
import { filterFormSchema } from "@/lib/validations/general";
/* eslint-disable @typescript-eslint/restrict-template-expressions */

import { redirect } from "next/navigation";
import { z } from "zod";

export async function searchAction(data: z.infer<typeof filterFormSchema>) {
  let url = "/bikes";

  if (!data.query) {
    if (data.doa?.from && data.doa?.to) {
      url += `?doa=${data.doa}`;
    }
  } else {
    url += `?query=${data.query}&queryType=${data.queryType}`;
  }

  return redirect(url);
}

export async function clearAction() {
  redirect(`/bikes`);
}
