"use server";
import { cookies } from "next/headers";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getUserInfo = async () => {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("access_token");
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken?.value}`,
      "Cache-Control": "no-store",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `회원 정보를 가져오는데 실패했습니다. Error: ${response.status} - ${response.statusText}`
    );
  }

  const userData = await response.json();
  return userData;
};

export const forgotPassword = async (data: string) => {
  const response = await fetch(
    `${API_BASE_URL}/users/forgot_password?email=${data}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `회원 정보를 가져오는데 실패했습니다. Error: ${response.status} - ${response.statusText}`
    );
  }

  const userData = await response.json();
  console.log(userData);
  return userData;
};

export const userDeleteInfo = async () => {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("access_token");
  const response = await fetch(`${API_BASE_URL}/users/delete`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken?.value}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `회원 정보를 가져오는데 실패했습니다. Error: ${response.status} - ${response.statusText}`
    );
  }

  const userData = await response.json();
  console.log(userData);
  return userData;
};
