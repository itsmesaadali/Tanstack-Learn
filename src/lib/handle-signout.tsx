import { toast } from "sonner";
import { authClient } from "./auth-client";
import { useNavigate } from "@tanstack/react-router";

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