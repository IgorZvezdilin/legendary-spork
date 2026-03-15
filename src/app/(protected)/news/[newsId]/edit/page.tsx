"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { listArticleGroups, type ArticleGroup } from "@/lib/article-groups";
import {
  getArticle,
  listArticles,
  createArticle,
  updateArticle,
  type Article,
  type ArticleInput,
} from "@/lib/articles";
import { getReport } from "@/lib/report";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const articleSchema = z.object({
  title: z.string().min(1, "Введите заголовок").max(255, "Максимум 255 символов"),
  subtitle: z.string().optional().or(z.literal("")),
  content: z.string().min(1, "Добавьте контент"),
  media_name: z.string().optional().or(z.literal("")),
  source_name: z.string().optional().or(z.literal("")),
  source_url: z.string().optional().or(z.literal("")),
  reprints: z
    .array(
      z.object({
        name: z.string().max(255, "Максимум 255 символов").optional().or(z.literal("")),
        url: z.string().url("Введите корректный URL"),
      })
    )
    .optional()
    .default([]),
  is_weekly_top: z.boolean().optional().default(false),
  total_media_reach: z.coerce.number().optional().default(0),
  topic_publications_count: z.coerce.number().optional().default(0),
});

type ArticleFormState = z.infer<typeof articleSchema>;

const emptyArticle: ArticleFormState = {
  title: "",
  subtitle: "",
  content: "",
  media_name: "",
  source_name: "",
  source_url: "",
  reprints: [],
  is_weekly_top: false,
  total_media_reach: 0,
  topic_publications_count: 0,
};

export default function NewsEditorPage() {
  const params = useParams<{ newsId: string }>();
  const searchParams = useSearchParams();
  const companyId = searchParams.get("companyId") ?? "";
  const reportId = params.newsId;
  const initialGroupId = searchParams.get("groupId");
  const initialGroupTitle = searchParams.get("groupTitle");
  const initialReportDate = searchParams.get("reportDate");
  const initialArticleId = searchParams.get("articleId");

  const [groups, setGroups] = useState<ArticleGroup[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  const form = useForm<ArticleFormState>({
    resolver: zodResolver(articleSchema),
    defaultValues: emptyArticle,
    mode: "onChange",
  });
  const reprintsFieldArray = useFieldArray({
    control: form.control,
    name: "reprints",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [reportDate, setReportDate] = useState<string | null>(initialReportDate);
  const [selectedGroupTitle, setSelectedGroupTitle] = useState<string | null>(initialGroupTitle);
  const router = useRouter();

  async function loadGroups() {
    if (!companyId || !reportId) return;
    setIsLoading(true);
    setError(null);
    try {
      const newsMeta = await getReport(companyId, reportId);
      if (!reportDate) {
        setReportDate(newsMeta.date_start ?? null);
      }
      const data = await listArticleGroups(companyId, reportId);
      setGroups(data);
      if (initialGroupId && data.some((group) => group.id === initialGroupId)) {
        setSelectedGroupId(initialGroupId);
        const found = data.find((group) => group.id === initialGroupId);
        setSelectedGroupTitle(found?.subgroup || found?.title || null);
      } else if (data[0]) {
        setSelectedGroupId((prev) => prev ?? data[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить группы");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadArticles(groupId: string | null) {
    if (!companyId || !reportId || !groupId) {
      setArticles([]);
      return;
    }
    setError(null);
    try {
      const data = await listArticles(companyId, reportId, groupId);
      setArticles(data);
      if (data[0]) {
        setSelectedArticleId((prev) => prev ?? data[0].id);
      } else {
        setSelectedArticleId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить статьи");
    }
  }

  useEffect(() => {
    loadGroups();
  }, [companyId, reportId]);

  useEffect(() => {
    loadArticles(selectedGroupId);
    setSelectedArticleId(null);
  }, [selectedGroupId]);

  useEffect(() => {
    if (!initialArticleId || !selectedGroupId || !companyId) return;
    if (selectedArticleId) return;
    getArticle(companyId, reportId, selectedGroupId, initialArticleId)
      .then((article) => {
        setSelectedArticleId(article.id);
        form.reset(normalizeArticleForm(article));
      })
      .catch(() => {
        // no-op, keep default form
      });
  }, [initialArticleId, selectedGroupId, companyId, reportId, selectedArticleId]);

  useEffect(() => {
    if (!selectedGroupId) {
      setSelectedGroupTitle(initialGroupTitle ?? null);
      return;
    }
    const found = groups.find((group) => group.id === selectedGroupId);
    if (found) {
      setSelectedGroupTitle(found.subgroup || found.title);
    }
  }, [groups, selectedGroupId, initialGroupTitle]);

  const selectedArticle = useMemo<Article | null>(() => {
    if (!selectedArticleId) return null;
    return articles.find((article) => article.id === selectedArticleId) ?? null;
  }, [articles, selectedArticleId]);

  const watchedValues = form.watch();

  const isDirty = useMemo(() => {
    if (!selectedArticleId) return true;
    if (!selectedArticle) return true;
    return !areArticleValuesEqual(
      normalizeArticleForm(selectedArticle),
      normalizeFormValues(watchedValues)
    );
  }, [selectedArticle, selectedArticleId, watchedValues]);

  const isValid = useMemo(() => {
    return !!selectedGroupId && form.formState.isValid;
  }, [form.formState.isValid, selectedGroupId]);

  useEffect(() => {
    if (!selectedArticle) {
      form.reset(emptyArticle);
      return;
    }

    form.reset(normalizeArticleForm(selectedArticle));
  }, [selectedArticle, form]);

  // removed structure controls

  async function handleSaveArticle(values: ArticleFormState) {
    if (!companyId || !selectedGroupId) return;

    setIsSaving(true);
    try {
      const payload = buildArticlePayload(values);
      if (selectedArticleId) {
        const updated = await updateArticle(
          companyId,
          reportId,
          selectedGroupId,
          selectedArticleId,
          payload
        );
        setArticles((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        router.push("/news");
      } else {
        const created = await createArticle(companyId, reportId, selectedGroupId, payload);
        setArticles((prev) => [created, ...prev]);
        setSelectedArticleId(created.id);
        router.push("/news");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить статью");
    } finally {
      setIsSaving(false);
    }
  }

  if (!companyId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Редактор выпуска</CardTitle>
          <CardDescription>Компания не выбрана. Вернитесь к списку выпусков.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Редактор статьи</CardTitle>
          <CardDescription>
            {selectedArticleId ? "Редактирование выбранной статьи." : "Создание новой статьи."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="grid gap-4" onSubmit={form.handleSubmit(handleSaveArticle)}>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Дата от новости</label>
                <Input value={reportDate ?? "—"} disabled className="bg-muted/30" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Название подгруппы</label>
                <Input value={selectedGroupTitle ?? "—"} disabled className="bg-muted/30" />
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Заголовок <span className="text-destructive">*</span>
              </label>
              <Input {...form.register("title")} />
              {form.formState.errors.title ? (
                <p className="text-destructive text-xs">{form.formState.errors.title.message}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Превью</label>
              <Input {...form.register("subtitle")} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Медиа</label>
              <Input {...form.register("media_name")} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Источник: название</label>
                <Input {...form.register("source_name")} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Источник: ссылка</label>
                <Input {...form.register("source_url")} />
              </div>
            </div>
            <div className="grid gap-3">
              <label className="text-sm font-medium">Перепечатки</label>
              {reprintsFieldArray.fields.length === 0 ? (
                <p className="text-muted-foreground text-xs">Перепечатки не добавлены.</p>
              ) : (
                <div className="grid gap-3">
                  {reprintsFieldArray.fields.map((field, index) => (
                    <div key={field.id} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Название</label>
                        <Input {...form.register(`reprints.${index}.name` as const)} />
                        {form.formState.errors.reprints?.[index]?.name ? (
                          <p className="text-destructive text-xs">
                            {form.formState.errors.reprints?.[index]?.name?.message}
                          </p>
                        ) : null}
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Ссылка</label>
                        <Input {...form.register(`reprints.${index}.url` as const)} />
                        {form.formState.errors.reprints?.[index]?.url ? (
                          <p className="text-destructive text-xs">
                            {form.formState.errors.reprints?.[index]?.url?.message}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => reprintsFieldArray.remove(index)}
                          aria-label="Удалить перепечатку"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => reprintsFieldArray.append({ name: "", url: "" })}
                >
                  Добавить перепечатку
                </Button>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Охват медиа</label>
                <Input type="number" min={0} {...form.register("total_media_reach")} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Количество публикаций</label>
                <Input type="number" min={0} {...form.register("topic_publications_count")} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="is_weekly_top"
                type="checkbox"
                className="accent-foreground size-4"
                checked={form.watch("is_weekly_top")}
                onChange={(event) => form.setValue("is_weekly_top", event.target.checked)}
              />
              <label htmlFor="is_weekly_top" className="text-sm font-medium">
                Еженедельный топ
              </label>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Контент <span className="text-destructive">*</span>
              </label>
              <div data-color-mode="dark" className="border-border/60 rounded-md border">
                <Controller
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <MDEditor
                      value={field.value}
                      onChange={(value) => field.onChange(value ?? "")}
                      height={360}
                    />
                  )}
                />
              </div>
              {form.formState.errors.content ? (
                <p className="text-destructive text-xs">{form.formState.errors.content.message}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="submit"
                disabled={isSaving || !isValid || (!!selectedArticleId && !isDirty)}
              >
                {selectedArticleId ? "Сохранить" : "Создать статью"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedArticleId(null);
                  form.reset(emptyArticle);
                  router.push("/news");
                }}
              >
                Отменить
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function normalizeArticleForm(article: Article): ArticleFormState {
  return {
    title: article.title ?? "",
    subtitle: article.subtitle ?? "",
    content: article.content ?? "",
    media_name: article.media_name ?? "",
    source_name: article.source?.[0]?.name ?? "",
    source_url: article.source?.[0]?.url ?? "",
    reprints:
      article.reprints?.map((item) => ({
        name: item.name ?? "",
        url: item.url ?? "",
      })) ?? [],
    is_weekly_top: Boolean(article.is_weekly_top),
    total_media_reach: article.total_media_reach ?? 0,
    topic_publications_count: article.topic_publications_count ?? 0,
  };
}

function normalizeFormValues(values: ArticleFormState): ArticleFormState {
  return {
    title: values.title ?? "",
    subtitle: values.subtitle ?? "",
    content: values.content ?? "",
    media_name: values.media_name ?? "",
    source_name: values.source_name ?? "",
    source_url: values.source_url ?? "",
    reprints: values.reprints ?? [],
    is_weekly_top: Boolean(values.is_weekly_top),
    total_media_reach: values.total_media_reach ?? 0,
    topic_publications_count: values.topic_publications_count ?? 0,
  };
}

function areArticleValuesEqual(a: ArticleFormState, b: ArticleFormState) {
  return (
    a.title === b.title &&
    a.subtitle === b.subtitle &&
    a.content === b.content &&
    a.media_name === b.media_name &&
    a.source_name === b.source_name &&
    a.source_url === b.source_url &&
    JSON.stringify(a.reprints ?? []) === JSON.stringify(b.reprints ?? []) &&
    a.is_weekly_top === b.is_weekly_top &&
    a.total_media_reach === b.total_media_reach &&
    a.topic_publications_count === b.topic_publications_count
  );
}

function buildArticlePayload(values: ArticleFormState): ArticleInput {
  const source =
    values.source_name || values.source_url
      ? [
          {
            name: values.source_name?.trim() || "",
            url: values.source_url?.trim() || "",
          },
        ]
      : [];
  const reprints =
    values.reprints
      ?.map((item) => ({
        name: item.name?.trim() || "",
        url: item.url?.trim() || "",
      }))
      .filter((item) => item.name || item.url) ?? [];

  return {
    title: values.title.trim(),
    subtitle: values.subtitle?.trim() || "",
    content: values.content,
    media_name: values.media_name?.trim() || "",
    source,
    reprints,
    is_weekly_top: Boolean(values.is_weekly_top),
    total_media_reach: values.total_media_reach ?? 0,
    topic_publications_count: values.topic_publications_count ?? 0,
  };
}
