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
} from "@/lib/articles";
import { getReport, publishReport } from "@/lib/report";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const articleSchema = z.object({
  title: z.string().min(1, "Введите заголовок").max(255, "Максимум 255 символов"),
  subtitle: z.string().optional().or(z.literal("")),
  author: z.string().optional().or(z.literal("")),
  content: z.string().min(1, "Добавьте контент"),
});

type ArticleFormState = z.infer<typeof articleSchema>;

const emptyArticle: ArticleFormState = {
  title: "",
  subtitle: "",
  author: "",
  content: "",
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
  const [isSaving, setIsSaving] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [reportDate, setReportDate] = useState<string | null>(initialReportDate);
  const [selectedGroupTitle, setSelectedGroupTitle] = useState<string | null>(initialGroupTitle);
  const router = useRouter();

  async function loadGroups() {
    if (!companyId || !reportId) return;
    setIsLoading(true);
    setError(null);
    try {
      const newsMeta = await getReport(companyId, reportId);
      setIsPublished(newsMeta.is_published);
      if (!reportDate) {
        setReportDate(newsMeta.date ?? null);
      }
      const data = await listArticleGroups(companyId, reportId);
      setGroups(data);
      if (initialGroupId && data.some((group) => group.id === initialGroupId)) {
        setSelectedGroupId(initialGroupId);
        const found = data.find((group) => group.id === initialGroupId);
        setSelectedGroupTitle(found?.title ?? null);
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
        form.reset({
          title: article.title,
          author: article.author,
          subtitle: article.subtitle,
          content: article.content,
        });
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
      setSelectedGroupTitle(found.title);
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
    return (
      selectedArticle.title !== watchedValues.title ||
      selectedArticle.author !== watchedValues.author ||
      selectedArticle.subtitle !== watchedValues.subtitle ||
      selectedArticle.content !== watchedValues.content
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

    form.reset({
      title: selectedArticle.title,
      author: selectedArticle.author,
      subtitle: selectedArticle.subtitle,
      content: selectedArticle.content,
    });
  }, [selectedArticle, form]);

  // removed structure controls

  async function handleSaveArticle(values: ArticleFormState) {
    if (!companyId || !selectedGroupId) return;

    setIsSaving(true);
    try {
      if (isPublished) {
        if (!isDirty || !isValid) return;
        if (selectedArticleId) {
          const updated = await updateArticle(
            companyId,
            reportId,
            selectedGroupId,
            selectedArticleId,
            values
          );
          setArticles((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        } else {
          const created = await createArticle(companyId, reportId, selectedGroupId, values);
          setArticles((prev) => [created, ...prev]);
          setSelectedArticleId(created.id);
        }
        setIsPublished(true);
        router.push("/news");
      } else if (!isDirty && isValid) {
        await publishReport(companyId, reportId);
        setIsPublished(true);
        router.push("/news");
      } else if (selectedArticleId) {
        const updated = await updateArticle(
          companyId,
          reportId,
          selectedGroupId,
          selectedArticleId,
          values
        );
        setArticles((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        router.push("/news");
      } else {
        const created = await createArticle(companyId, reportId, selectedGroupId, values);
        setArticles((prev) => [created, ...prev]);
        setSelectedArticleId(created.id);
        setIsPublished(false);
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
              <label className="text-sm font-medium">Автор</label>
              <Input {...form.register("author")} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Превью</label>
              <Input {...form.register("subtitle")} />
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
              {isPublished ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button type="button" disabled>
                        Опубликовать
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Уже опубликовано</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <Button type="submit" disabled={isSaving || !isValid || (isPublished && !isDirty)}>
                  {isPublished
                    ? "Сохранить"
                    : !isDirty && selectedArticleId && isValid
                      ? "Опубликовать"
                      : selectedArticleId
                        ? "Сохранить"
                        : "Создать статью"}
                </Button>
              )}
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
