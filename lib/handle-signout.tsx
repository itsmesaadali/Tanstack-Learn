"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authClient } from "./auth-client";

export const useSignout = () => {
  const router = useRouter();

  const handleSignout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Successfully logged out");
            router.push("/");
          },
          onError: ({ error }: { error: Error }) => {
            toast.error(error.message);
          },
        },
      });
    } catch (error) {
      toast.error("An error occurred during sign out");
    }
  };

  return { handleSignout };
};
