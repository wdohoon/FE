"use client";
import React, {useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useQueryClient} from "@tanstack/react-query";
import {diarySchema, DiaryFormData} from "@/utils/diarySchema";
import Image from "next/image";
import dynamic from "next/dynamic";
import {DayPicker} from "react-day-picker";
import Heading from "@/components/ui/Heading";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import MoodRadio from "@/components/diary/MoodRadio";
import WeatherRadio from "@/components/diary/WeatherRadio";
import Modal from "@/components/ui/Modal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {useSendDiary} from "@/hooks/useDiary";
import {useRouter} from "next/navigation";

const TipTapEditor = dynamic(() => import("@/components/diary/TipTapEditor"), {ssr: false});

const WritePage = () => {
    const queryClient = useQueryClient();
    const router = useRouter();
    // 일기 전송 함수
    const {mutate, isPending} = useSendDiary();
    // 폼 데이터 저장
    const [formData, setFormData] = useState<FormData | null>(null);
    // 작성 모달 상태
    const [isWriteModalOpen, setWriteModalOpen] = useState(false);
    // 완료 모달 상태
    const [isCompleteModalOpen, setCompleteModalOpen] = useState(false);
    // 날짜
    const [isOpenDayPicker, setOpenDayPicker] = useState(false);

    const closeModal = () => {
        setWriteModalOpen(false);
        setCompleteModalOpen(false);
    };
    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        watch,
        formState: {errors},
    } = useForm<DiaryFormData>({
        resolver: zodResolver(diarySchema),
        defaultValues: {
            title: "",
            write_date: "",
            weather: "",
            mood: "",
            content: "",
            image: null,
        },
    });
    // 필요한 폼 필드들을 모두 watch
    const currentMood = watch("mood");
    const currentWeather = watch("weather");

    // 폼 제출
    const onSubmit = (data: DiaryFormData) => {
        // 작성모달
        setWriteModalOpen(true);
        const formData = new FormData();

        // 폼 데이터 추가
        formData.append("title", data.title);
        formData.append("write_date", data.write_date);
        formData.append("mood", data.mood);
        formData.append("weather", data.weather);
        formData.append("content", data.content);
        if (data.image) {
            formData.append("image", data.image);
        }

        setFormData(formData);
        console.log(formData);
    };
    const handleConfirm = () => {
        if (formData) {
            mutate(formData, {
                onSuccess: () => {
                    setCompleteModalOpen(true);
                    setWriteModalOpen(false);
                    setFormData(null);
                    // ✅ 기존 데이터를 무효화 → 최신 데이터 강제 새로고침
                    queryClient.invalidateQueries({queryKey: ["diaries"]});
                },
                onError: error => {
                    console.error("작성 실패 ❌", error);
                    alert("일기 작성에 실패했습니다. 다시 시도해주세요.");
                },
            });
        }
    };
    //  "작성 완료" 모달의 확인 버튼을 눌렀을 때 이동
    const handleCompleteConfirm = () => {
        setCompleteModalOpen(false);
        router.push("/diary"); // ✅ 여기서 페이지 이동
    };
    if (isPending) {
        return <LoadingSpinner />;
    }

    return (
        <div>
            <div className="text-center">
                <Heading tag="h2">오늘의 일기</Heading>
                <Heading
                    tag="p"
                    className="mt-2"
                >
                    오늘의 기분은 어떠셨나요? <br />
                    하루를 정리하며 기록해보세요.
                </Heading>
            </div>
            <form
                className="space-y-4"
                onSubmit={handleSubmit(onSubmit)}
            >
                {/* 제목 */}
                <Input
                    id="title"
                    label="제목"
                    type="text"
                    placeholder="제목을 입력해주세요"
                    isWhite={true}
                    {...register("title")}
                />
                {errors.title && <p className="text-red-500 text-sm !mt-2">{errors.title.message}</p>}

                {/* 날짜 */}
                <div className="relative">
                    <p className="mb-2">날짜</p>
                    <button
                        type="button"
                        className="justify-between p-3 text-black bg-white border-lightgray border rounded-xl flex w-full"
                        onClick={() => setOpenDayPicker(prev => !prev)}
                    >
                        <span className={`${getValues("write_date") ? "text-black" : "text-gray"}`}>
                            {getValues("write_date")
                                ? new Date(getValues("write_date")).toLocaleDateString("ko-KR", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                  })
                                : "날짜를 선택해주세요"}
                        </span>
                        <Image
                            src="/icons/calendar.svg"
                            alt="달력아이콘"
                            width={24}
                            height={24}
                        />
                    </button>
                    {isOpenDayPicker && (
                        <DayPicker
                            mode="single"
                            selected={getValues("write_date") ? new Date(getValues("write_date")) : undefined}
                            onSelect={(date: Date | undefined) => {
                                if (date) {
                                    // UTC 날짜를 로컬 시간으로 변환
                                    const year = date.getFullYear();
                                    const month = String(date.getMonth() + 1).padStart(2, "0");
                                    const day = String(date.getDate()).padStart(2, "0");
                                    const localDate = `${year}-${month}-${day}`;

                                    setValue("write_date", localDate);
                                    setOpenDayPicker(false); // 선택 후 달력 닫기
                                }
                            }}
                            fixedWeeks
                            className="absolute z-50 w-[18.75rem] mt-[0.7rem]"
                        />
                    )}
                    {errors.write_date && <p className="text-red-500 text-sm !mt-2">{errors.write_date.message}</p>}
                </div>

                {/* 기분 */}
                <MoodRadio
                    onChange={value => {
                        setValue("mood", value);
                    }}
                    value={currentMood}
                    error={errors.mood?.message}
                />

                {/* 날씨 */}
                <WeatherRadio
                    onChange={value => setValue("weather", value)}
                    value={currentWeather}
                    error={errors.weather?.message}
                />

                {/* 내용 */}
                <TipTapEditor
                    value={getValues("content")}
                    onChange={value => setValue("content", value)}
                    onImageAdd={file => setValue("image", file)}
                />
                {errors.content && <p className="text-red-500 text-sm !mt-2">{errors.content.message}</p>}

                <div className="flex !mt-[3.25rem] items-center">
                    <Button
                        type="submit"
                        variant="sand"
                    >
                        작성
                    </Button>
                </div>
            </form>

            {isWriteModalOpen && (
                <Modal
                    title="일기를 작성하시겠습니까?"
                    description="일기를 작성하시면 수정이 불가능합니다."
                    onCancel={closeModal}
                    onConfirm={handleConfirm}
                    cancelText="취소"
                    confirmText="확인"
                />
            )}
            {isCompleteModalOpen && (
                <Modal
                    title="일기 작성을 완료하였습니다."
                    description="내 일기 목록에서 확인해보세요."
                    onConfirm={handleCompleteConfirm}
                    confirmText="확인"
                    confirmType={true}
                />
            )}
        </div>
    );
};

export default WritePage;
