"use client";

import { Link, useRouter } from "@/i18n/navigation";
import { BookOpen, Home, MoveLeft } from "lucide-react";

export function NotFoundPage() {
  const router = useRouter();

  return (
    <main className="parchment-surface relative flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Khung Card Sách Trung Tâm */}
      <div className="relative w-full max-w-5xl rounded-[28px] border-[2.5px] border-[#261E19]/15 bg-[#FCFAF5] p-6 shadow-[0_12px_36px_rgba(38,30,25,0.08)] sm:p-10">
        {/* Header trên cùng của thẻ */}
        <header className="flex items-center justify-between border-b border-[#261E19]/10 pb-5">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition hover:opacity-85"
            title="Về trang chủ"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#261E19]/15 bg-[#EDE2CA]/50 text-[#524338]">
              <BookOpen className="h-4 w-4" />
            </div>
            <span className="font-sans text-base font-extrabold tracking-tight text-[#261E19]">
              LearnVerse
            </span>
          </Link>

          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[#786759]">
            Chương bị thất lạc
          </span>
        </header>

        {/* Khung minh họa cuốn sách 404 (SVG vẽ tay mềm mại) */}
        <div className="relative my-8 flex items-center justify-center sm:my-10">
          <div className="animate-float-slow relative w-full max-w-[420px]">
            <svg
              viewBox="0 0 500 380"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-auto w-full select-none overflow-visible"
            >
              {/* Bóng elip dưới chân sách */}
              <ellipse
                cx="250"
                cy="350"
                rx="180"
                ry="18"
                fill="#EDE2CA"
                opacity="0.8"
              />

              {/* Ngôi sao lấp lánh màu vàng cam (Góc trên trái) */}
              <g className="animate-star-twinkle origin-[80px_110px]">
                <path
                  d="M80 85 C80 100, 84 108, 98 110 C84 112, 80 120, 80 135 C80 120, 76 112, 62 110 C76 108, 80 100, 80 85 Z"
                  fill="#F2B84B"
                />
              </g>

              {/* Đốm tròn màu tím pastel nhạt (Góc dưới trái) */}
              <circle cx="105" cy="245" r="11" fill="#C5B4E3" opacity="0.85" />

              {/* Ngôi sao 4 cánh màu xô thơm Sage (Góc phải dưới) */}
              <g className="animate-star-twinkle origin-[400px_250px]">
                <path
                  d="M400 232 C400 244, 404 250, 414 252 C404 254, 400 260, 400 272 C400 260, 396 254, 386 252 C396 250, 400 244, 400 232 Z"
                  fill="#7FA682"
                />
              </g>

              {/* Thẻ đánh dấu trang màu vàng hình tam giác gập sang mép phải */}
              <polygon
                points="355,95 400,140 365,180"
                fill="#F2B84B"
                stroke="#524338"
                strokeWidth="4"
                strokeLinejoin="round"
              />

              {/* Lưng gáy sách và bóng gập nền phía sau */}
              <rect
                x="120"
                y="52"
                width="265"
                height="282"
                rx="32"
                transform="rotate(-4 250 190)"
                fill="#524338"
              />

              {/* Bìa và các trang sách mở (Nền kem ngà) */}
              <rect
                x="124"
                y="50"
                width="258"
                height="276"
                rx="28"
                transform="rotate(-4 250 190)"
                fill="#FAF6EC"
                stroke="#261E19"
                strokeWidth="5"
              />

              {/* Đường gân / rãnh gập đôi giữa 2 trang sách */}
              <line
                x1="247"
                y1="68"
                x2="262"
                y2="322"
                stroke="#261E19"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.35"
              />

              {/* Các dòng kẻ tượng trưng trên trang trái */}
              <line
                x1="150"
                y1="130"
                x2="225"
                y2="124"
                stroke="#261E19"
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.25"
              />
              <line
                x1="152"
                y1="148"
                x2="220"
                y2="142"
                stroke="#261E19"
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.25"
              />

              {/* Các dòng kẻ tượng trưng trên trang phải */}
              <line
                x1="280"
                y1="118"
                x2="348"
                y2="112"
                stroke="#261E19"
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.25"
              />
              <line
                x1="282"
                y1="136"
                x2="352"
                y2="130"
                stroke="#261E19"
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.25"
              />

              {/* Con số 404 màu gạch nung terracotta vẽ tay nổi bật */}
              <text
                x="250"
                y="226"
                textAnchor="middle"
                transform="rotate(-4 250 210)"
                fill="#D96B43"
                fontSize="108"
                fontWeight="900"
                fontFamily="var(--font-landing-page-display, 'Patrick Hand', cursive, sans-serif)"
                letterSpacing="1px"
              >
                404
              </text>

              {/* Nét vẽ vòng cung biểu cảm trang sách hơi buồn ngơ ngác */}
              <path
                d="M230 252 Q 256 238, 280 250"
                stroke="#D96B43"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
              />
              <line
                x1="256"
                y1="245"
                x2="258"
                y2="265"
                stroke="#D96B43"
                strokeWidth="3.5"
                strokeLinecap="round"
                opacity="0.8"
              />
            </svg>
          </div>
        </div>

        {/* Nội dung thông điệp */}
        <div className="text-center">
          <h1
            className="text-2xl font-black text-[#261E19] sm:text-3xl"
            style={{ fontFamily: "var(--font-landing-page-display), cursive" }}
          >
            Ối! Trang sách này đi lạc rồi!
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#786759]">
            Có vẻ chương bạn tìm kiếm chưa tồn tại hoặc đã chuyển sang nơi khác.
            Hãy quay về và tiếp tục hành trình học tập nhé!
          </p>

          {/* Các nút điều hướng */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            {/* Nút Về trang chủ (Màu Terracotta ấm) */}
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border-2 border-[#B54F2A] bg-[#D96B43] px-5 text-sm font-bold text-white shadow-[0_2px_0_#B54F2A] transition hover:-translate-y-0.5 hover:bg-[#B54F2A] active:translate-y-0 active:shadow-none"
            >
              <Home className="h-4 w-4" />
              <span>Về trang chủ</span>
            </Link>

            {/* Nút Quay lại trang trước */}
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border-2 border-[#261E19]/25 bg-[#FCFAF5] px-5 text-sm font-bold text-[#261E19] transition hover:-translate-y-0.5 hover:bg-[#FAF6EC] active:translate-y-0"
            >
              <MoveLeft className="h-4 w-4" />
              <span>Quay lại</span>
            </button>
          </div>

          {/* Dòng chữ nhỏ dưới chân trang */}
          <p
            className="mt-8 text-xs text-[#786759]/80"
            style={{ fontFamily: "var(--font-landing-hand), cursive" }}
          >
            Mọi cuộc phiêu lưu đều có một vài ngã rẽ bất ngờ.
          </p>
        </div>
      </div>
    </main>
  );
}
