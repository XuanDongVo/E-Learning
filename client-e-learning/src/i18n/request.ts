import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

type Locale = "vi" | "en";

async function loadJson(locale: Locale, path: string) {
  try {
    return (await import(`../messages/${locale}/${path}.json`)).default;
  } catch (error) {
    // if (locale === "en") {
      return (await import(`../messages/vi/${path}.json`)).default;
    // }

    throw error;
  }
}

async function loadMessages(locale: Locale) {
  const [
    common,
    navigation,
    form,
    feedback,
    errors,
    teacherDashboard,
    teacherContent,
    teacherClasses,
    teacherStudents,
    teacherAssignments,
    teacherActivities,
    teacherAnalytics,
    studentDashboard,
    studentLearning,
    studentAssignments,
    studentActivities,
    studentProgress,
    studentAssignmentAttempt,
  ] = await Promise.all([
    loadJson(locale, "common"),
    loadJson(locale, "navigation"),
    loadJson(locale, "form"),
    loadJson(locale, "feedback"),
    loadJson(locale, "error"),
    loadJson(locale, "teacher/dashboard"),
    loadJson(locale, "teacher/content"),
    loadJson(locale, "teacher/classes"),
    loadJson(locale, "teacher/students"),
    loadJson(locale, "teacher/assignments"),
    loadJson(locale, "teacher/activities"),
    loadJson(locale, "teacher/analytics"),
    loadJson(locale, "student/dashboard"),
    loadJson(locale, "student/learning"),
    loadJson(locale, "student/assignments"),
    loadJson(locale, "student/activities"),
    loadJson(locale, "student/progress"),
    loadJson(locale, "student/assignment-attempt"),
  ]);

  const teacher = {
    dashboard: teacherDashboard,
    content: teacherContent,
    classes: teacherClasses,
    students: teacherStudents,
    assignments: teacherAssignments,
    activities: teacherActivities,
    analytics: teacherAnalytics,
  };

  const student = {
    dashboard: studentDashboard,
    learning: studentLearning,
    assignments: studentAssignments,
    activities: studentActivities,
    progress: studentProgress,
    assignmentAttempt: studentAssignmentAttempt.assignmentAttempt,
  };

  return {
    ...common,
    ...navigation,
    common,
    navigation,
    form,
    feedback,
    errors,
    teacher,
    student,
  };
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;

  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: await loadMessages(locale as Locale),
  };
});