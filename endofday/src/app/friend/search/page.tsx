"use client";

import React, { useState } from "react";
import ProfileCard from "@/components/friend/ProfileCard";
import Pagination from "@/components/friend/Pagination";
import { useMutation } from "@tanstack/react-query";
import { addFriend } from "@/api/friendApi";
import SearchInput from "@/components/ui/SearchInput";

// 가상의 유저 데이터 (실제로는 서버 API 호출)
interface User {
  id: number;
  name: string;
  statusMessage: string;
  profileImage: string;
}

const mockUsers: User[] = [
  { id: 1, name: "검색결과유저1", statusMessage: "상태메시지1", profileImage: "https://via.placeholder.com/50" },
  { id: 2, name: "검색결과유저2", statusMessage: "상태메시지2", profileImage: "https://via.placeholder.com/50" },
  { id: 3, name: "검색결과유저3", statusMessage: "상태메시지3", profileImage: "https://via.placeholder.com/50" },
  { id: 4, name: "검색결과유저4", statusMessage: "상태메시지4", profileImage: "https://via.placeholder.com/50" },
  { id: 5, name: "검색결과유저5", statusMessage: "상태메시지5", profileImage: "https://via.placeholder.com/50" },
];

const FriendSearchPage = () => {
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // 친구추가 mutation
  const { mutate: addFriendMutate } = useMutation({
    mutationFn: (userId: number) => addFriend(userId),
    onSuccess: () => {
      alert("친구 요청을 보냈습니다!");
    },
    onError: () => {
      alert("친구 신청에 실패했습니다.");
    },
  });

  // 검색 로직 (가상의 front filtering)
  // 실제로는 `/users/search?keyword=${searchText}` API 등을 호출
  const filteredUsers = mockUsers.filter((u) =>
    u.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // 페이지네이션
  const pageSize = 2;
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // SearchInput에서 엔터 or 아이콘 클릭 시
  const handleSearch = () => {
    // 실제로는 서버에 검색 요청
    alert(`"${searchText}"로 검색 (추후 API 연동)`);
  };

  return (
    <div className="mt-8">
      <h2 className="text-center text-2xl font-bold mb-4">친구 찾기</h2>

      <SearchInput
        placeholder="이메일과 닉네임으로 친구를 검색해보세요"
        value={searchText}
        onChange={(val) => setSearchText(val)}
        onSearch={handleSearch}
        className="mb-4"
      />

      <div className="flex flex-col gap-4 px-4">
        {currentUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg"
          >
            <ProfileCard
              profileImage={user.profileImage}
              name={user.name}
              statusMessage={user.statusMessage}
            />
            <div>
              <button
                className="px-4 py-2 bg-[#E7CCA9] rounded-full hover:bg-[#C9A782] font-semibold"
                onClick={() => addFriendMutate(user.id)}
              >
                친구추가
              </button>
            </div>
          </div>
        ))}

        <div className="mt-4 text-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>
    </div>
  );
};

export default FriendSearchPage;
