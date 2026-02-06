import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { authClient } from "./auth-client";

export const useSignout = () => {
  const navigate = useNavigate();
  
  const handleSignout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            navigate({ to: "/" });
            toast.success("Successfully logged out");
          },
          onError: ({ error }) => {
            toast.error(error.message);
          }
        }
      });
    } catch (error) {
      toast.error("An error occurred during sign out");
    }
  };

  return { handleSignout };
};