"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, CircleHelp, Clock3, Heart, Lightbulb, Send, SlidersHorizontal } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { activitySessionService } from "@/services/student/activity-session.service";
import type { ActivitySession, ActivitySessionMode, ActivitySessionQuestion, SelectionStrategy } from "@/types/student/activity-session";
import { PracticeSettings } from "./practice-setting";

