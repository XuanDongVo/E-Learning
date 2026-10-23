import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

async function loadMessages(locale: "vi" | "en") {
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
  ] = await Promise.all([
    import(`../messages/${locale}/common.json`),
    import(`../messages/${locale}/navigation.json`),
    import(`../messages/${locale}/form.json`),
    import(`../messages/${locale}/feedback.json`),
    import(`../messages/${locale}/error.json`),
    import(`../messages/${locale}/teacher/dashboard.json`),
    import(`../messages/${locale}/teacher/content.json`),
    import(`../messages/${locale}/teacher/classes.json`),
    import(`../messages/${locale}/teacher/students.json`),
    import(`../messages/${locale}/teacher/assignments.json`),
    import(`../messages/${locale}/teacher/activities.json`),
    import(`../messages/${locale}/teacher/analytics.json`),
    import(`../messages/${locale}/student/dashboard.json`),
    import(`../messages/${locale}/student/learning.json`),
    import(`../messages/${locale}/student/assignments.json`),
    import(`../messages/${locale}/student/activities.json`),
    import(`../messages/${locale}/student/progress.json`),
  ]);

  const teacher = {
    dashboard: teacherDashboard.default,
    content: teacherContent.default,
    classes: teacherClasses.default,
    students: teacherStudents.default,
    assignments: teacherAssignments.default,
    activities: teacherActivities.default,
    analytics: teacherAnalytics.default,
  };
  const student = {
    dashboard: studentDashboard.default,
    learning: studentLearning.default,
    assignments: studentAssignments.default,
    activities: studentActivities.default,
    progress: studentProgress.default,
  };

  // Keep existing root-level keys working during the incremental migration.
  return {
    ...common.default,
    ...navigation.default,
    ...teacher.content,
    ...errors.default,
    teacher,
    student,
    common: common.default,
    navigation: navigation.default,
    form: form.default,
    feedback: feedback.default,
  };
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: await loadMessages(locale as "vi" | "en"),
  };
});
