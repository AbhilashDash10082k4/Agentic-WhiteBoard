import React, { useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "@/context/UserContext";
function Provider({ children }: { children: React.ReactNode }) {
  const [userDetail, setuserDetail] = useState();
  const CreateNewUser = async () => {
    const res = await axios.post("api/user");
    console.log(res.data);
    setuserDetail(res.data);
  };
  useEffect(() => {
    CreateNewUser();
  }, []);
  return (
    <UserContext.Provider value={{ userDetail, setuserDetail }}>
      <div>Provider</div>
    </UserContext.Provider>
  );
}

export default Provider;
