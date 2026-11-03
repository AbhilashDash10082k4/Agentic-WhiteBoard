"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { UserContext } from "@/context/UserContext";

function Provider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const [userDetail, setuserDetail] = useState<any>(null);

  // Sync authenticated Clerk user to DB
  const syncUser = async () => {
    try {
      const res = await axios.post("/api/user");
      setuserDetail(res.data);
    } catch (err) {
      console.error("Failed to sync user:", err);
    }
  };

  useEffect(() => {
    // Only sync once Clerk auth session resolves
    if (isLoaded && user) {
      syncUser();
    }
  }, [user, isLoaded]);

  return (
    <UserContext.Provider value={{ userDetail, setuserDetail }}>
      <div>{children}</div>
    </UserContext.Provider>
  );
}

export default Provider;
