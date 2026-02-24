"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { MoreHorizontal, Pencil } from "lucide-react";
import {
  createReport,
  deleteReport,
  listReports,
  updateReport,
  type ReportItem,
  type ReportInput,
} from "@/lib/report";
import { listCompanies, type Company } from "@/lib/companies";
import {
  createArticleGroup,
  deleteArticleGroup,
  listArticleGroups,
  updateArticleGroup,
  type ArticleGroup,
} from "@/lib/article-groups";
import { deleteArticle, listArticles, type Article } from "@/lib/articles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/date-picker";
import { useAppContext } from "@/contexts/filter.context";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function NewsPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState("");
  const [news, setNews] = useState<ReportItem[]>([]);
  const [form, setForm] = useState<ReportInput>({
    date: new Date().toISOString().slice(0, 10),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<ReportItem | null>(null);
  const [editingDate, setEditingDate] = useState("");
  const [groupModalReportId, setGroupModalReportId] = useState<string | null>(null);
  const [groupTitle, setGroupTitle] = useState("");
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupModalMode, setGroupModalMode] = useState<"create" | "edit">("create");
  const [groupsByReport, setGroupsByReport] = useState<Record<string, ArticleGroup[]>>({});
  const [loadingGroups, setLoadingGroups] = useState<Record<string, boolean>>({});
  const [openReportId, setOpenReportId] = useState<string | null>(null);
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const [articlesByGroup, setArticlesByGroup] = useState<Record<string, Article[]>>({});
  const [loadingArticles, setLoadingArticles] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { date: dateContext, setDate: setDateContext } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    listCompanies()
      .then((data) => {
        if (isMounted) {
          setCompanies(data);
          if (!companyId && data[0]) setCompanyId(data[0].id);
        }
      })
      .catch((err) => {
        if (isMounted)
          setError(err instanceof Error ? err.message : "Не удалось загрузить компании");
      });

    return () => {
      isMounted = false;
    };
  }, [companyId]);

  useEffect(() => {
    if (!companyId) return;
    let isMounted = true;
    listReports(companyId)
      .then((data) => {
        if (isMounted) setNews(data);
      })
      .catch((err) => {
        if (isMounted)
          setError(err instanceof Error ? err.message : "Не удалось загрузить новости");
      });

    return () => {
      isMounted = false;
    };
  }, [companyId]);

  useEffect(() => {
    if (!dateContext) return;
    if (editingReport) {
      setEditingDate(dateContext);
    } else {
      setForm((prev) => ({ ...prev, date: dateContext }));
    }
  }, [dateContext, editingReport]);

  useEffect(() => {
    setDateContext(form.date);
  }, []);

  const selectedCompany = useMemo(
    () => companies.find((company) => company.id === companyId) ?? null,
    [companies, companyId]
  );

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!companyId) return;
    if (!form.date) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const created = await createReport(companyId, form);
      setNews((prev) => [created, ...prev]);
      setForm({ date: new Date().toISOString().slice(0, 10) });
      setDateContext(new Date().toISOString().slice(0, 10));
      setIsModalOpen(false);
    } catch (err) {
      if (err instanceof Error && err.message === "REPORT_DATE_CONFLICT") {
        setToastMessage("Отчет на эту дату уже существует.");
      } else {
        setError(err instanceof Error ? err.message : "Не удалось создать выпуск");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEditSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!companyId || !editingReport || !editingDate) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const updated = await updateReport(companyId, editingReport.id, { date: editingDate });
      setNews((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setEditingReport(null);
      setEditingDate("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось обновить новость");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCreateGroup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!companyId || !groupModalReportId || !groupTitle.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      if (groupModalMode === "edit" && editingGroupId) {
        const updated = await updateArticleGroup(companyId, groupModalReportId, editingGroupId, {
          title: groupTitle.trim(),
        });
        setGroupsByReport((prev) => ({
          ...prev,
          [groupModalReportId]: (prev[groupModalReportId] || []).map((group) =>
            group.id === updated.id ? updated : group
          ),
        }));
      } else {
        const created = await createArticleGroup(companyId, groupModalReportId, {
          title: groupTitle.trim(),
        });
        setGroupsByReport((prev) => ({
          ...prev,
          [groupModalReportId]: [created, ...(prev[groupModalReportId] || [])],
        }));
        setOpenReportId(groupModalReportId);
      }
      setGroupTitle("");
      setGroupModalReportId(null);
      setEditingGroupId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось создать подгруппу");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteGroup(reportId: string, groupId: string) {
    if (!companyId) return;
    if (!confirm("Удалить подгруппу? Это действие нельзя отменить.")) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await deleteArticleGroup(companyId, reportId, groupId);
      setGroupsByReport((prev) => ({
        ...prev,
        [reportId]: (prev[reportId] || []).filter((group) => group.id !== groupId),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось удалить подгруппу");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function ensureGroupsLoaded(reportId: string) {
    if (groupsByReport[reportId] || loadingGroups[reportId]) return;
    setLoadingGroups((prev) => ({ ...prev, [reportId]: true }));
    try {
      const groups = await listArticleGroups(companyId, reportId);
      setGroupsByReport((prev) => ({ ...prev, [reportId]: groups }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить подгруппы");
    } finally {
      setLoadingGroups((prev) => ({ ...prev, [reportId]: false }));
    }
  }

  async function ensureArticlesLoaded(reportId: string, groupId: string) {
    if (articlesByGroup[groupId] || loadingArticles[groupId]) return;
    setLoadingArticles((prev) => ({ ...prev, [groupId]: true }));
    try {
      const articles = await listArticles(companyId, reportId, groupId);
      setArticlesByGroup((prev) => ({ ...prev, [groupId]: articles }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить статьи");
    } finally {
      setLoadingArticles((prev) => ({ ...prev, [groupId]: false }));
    }
  }

  async function handleDeleteArticle(reportId: string, groupId: string, articleId: string) {
    if (!companyId) return;
    if (!confirm("Удалить статью? Это действие нельзя отменить.")) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await deleteArticle(companyId, reportId, groupId, articleId);
      setArticlesByGroup((prev) => ({
        ...prev,
        [groupId]: (prev[groupId] || []).filter((article) => article.id !== articleId),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось удалить статью");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(reportId: string) {
    if (!companyId) return;
    if (!confirm("Удалить новость? Это действие нельзя отменить.")) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await deleteReport(companyId, reportId);
      setNews((prev) => prev.filter((item) => item.id !== reportId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось удалить новость");
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  return (
    <div className="flex flex-1 flex-col gap-6">
      {toastMessage ? (
        <div className="border-border/60 bg-card fixed top-6 right-6 z-50 rounded-lg border px-4 py-3 text-sm shadow-lg">
          {toastMessage}
        </div>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-3">
            <span>Новости</span>
            <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
              <Dialog.Trigger asChild>
                <Button type="button" variant="outline" size="icon" aria-label="Добавить новость">
                  <Pencil className="size-4" />
                </Button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="bg-foreground/40 fixed inset-0 z-40" />
                <Dialog.Content className="border-border/60 bg-card fixed top-1/2 left-1/2 z-50 w-[95vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border p-6 shadow-lg">
                  <div className="space-y-2">
                    <Dialog.Title className="text-lg font-semibold">Создать новость</Dialog.Title>
                    <Dialog.Description className="text-muted-foreground text-sm">
                      Укажите дату выпуска и сохраните запись.
                    </Dialog.Description>
                  </div>
                  <form className="mt-4 grid gap-4" onSubmit={handleCreate}>
                    <div className="flex items-center">
                      <DatePicker />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="submit" disabled={isSubmitting || !companyId}>
                        {isSubmitting ? "Создание..." : "Создать"}
                      </Button>
                      <Dialog.Close asChild>
                        <Button type="button" variant="outline">
                          Отмена
                        </Button>
                      </Dialog.Close>
                    </div>
                  </form>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </CardTitle>
          <CardDescription>Выберите компанию и управляйте выпусками.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex flex-1 flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="company">
                Компания
              </label>
              <select
                id="company"
                className="border-input bg-background h-10 rounded-md border px-3 text-sm"
                value={companyId}
                onChange={(event) => setCompanyId(event.target.value)}
              >
                <option value="" disabled>
                  Выберите компанию
                </option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedCompany ? (
            <div className="border-border/60 bg-muted/30 rounded-lg border px-4 py-3 text-sm">
              Работаем с: <span className="font-medium">{selectedCompany.name}</span>
            </div>
          ) : null}

          {error ? (
            <p
              className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm"
              role="alert"
            >
              {error}
            </p>
          ) : null}
        </CardContent>
      </Card>
      <Dialog.Root open={!!editingReport} onOpenChange={(open) => !open && setEditingReport(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="bg-foreground/40 fixed inset-0 z-40" />
          <Dialog.Content className="border-border/60 bg-card fixed top-1/2 left-1/2 z-50 w-[95vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border p-6 shadow-lg">
            <div className="space-y-2">
              <Dialog.Title className="text-lg font-semibold">Редактировать новость</Dialog.Title>
              <Dialog.Description className="text-muted-foreground text-sm">
                Измените дату выпуска и сохраните.
              </Dialog.Description>
            </div>
            <form className="mt-4 grid gap-4" onSubmit={handleEditSubmit}>
              <div className="flex items-center">
                <DatePicker />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Сохранение..." : "Сохранить"}
                </Button>
                <Dialog.Close asChild>
                  <Button type="button" variant="outline" onClick={() => setEditingReport(null)}>
                    Отмена
                  </Button>
                </Dialog.Close>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Dialog.Root
        open={!!groupModalReportId}
        onOpenChange={(open) => {
          if (!open) {
            setGroupModalReportId(null);
            setEditingGroupId(null);
            setGroupTitle("");
            setGroupModalMode("create");
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="bg-foreground/40 fixed inset-0 z-40" />
          <Dialog.Content className="border-border/60 bg-card fixed top-1/2 left-1/2 z-50 w-[95vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border p-6 shadow-lg">
            <div className="space-y-2">
              <Dialog.Title className="text-lg font-semibold">
                {groupModalMode === "edit" ? "Редактировать подгруппу" : "Добавить подгруппу"}
              </Dialog.Title>
              <Dialog.Description className="text-muted-foreground text-sm">
                Укажите название подгруппы.
              </Dialog.Description>
            </div>
            <form className="mt-4 grid gap-4" onSubmit={handleCreateGroup}>
              <input
                type="text"
                className="border-input bg-background h-10 rounded-md border px-3 text-sm"
                placeholder="Название подгруппы"
                value={groupTitle}
                onChange={(event) => setGroupTitle(event.target.value)}
                required
              />
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? groupModalMode === "edit"
                      ? "Сохранение..."
                      : "Создание..."
                    : groupModalMode === "edit"
                      ? "Сохранить"
                      : "Добавить"}
                </Button>
                <Dialog.Close asChild>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setGroupModalReportId(null)}
                  >
                    Отмена
                  </Button>
                </Dialog.Close>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <div className="grid gap-3">
        {news.length === 0 ? (
          <p className="text-muted-foreground text-sm">Пока нет новостей для выбранной компании.</p>
        ) : (
          news.map((item) => (
            <Card key={item.id}>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-muted-foreground text-xs">
                      {item.is_published ? "Опубликовано" : "Черновик"}
                    </span>
                    <p className="font-medium">Новость от: {item.date}</p>
                    <p className="text-muted-foreground text-xs">ID: {item.id}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="icon" aria-label="Действия">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-56 p-2">
                        <div className="flex flex-col gap-1">
                          <Link
                            className="hover:bg-accent rounded-md px-3 py-2 text-sm"
                            href="#"
                            onClick={(event) => {
                              event.preventDefault();
                              setEditingReport(item);
                              setEditingDate(item.date);
                              setDateContext(item.date);
                            }}
                          >
                            Редактировать новость
                          </Link>
                          <button
                            type="button"
                            className="hover:bg-accent rounded-md px-3 py-2 text-left text-sm"
                            onClick={() => {
                              setGroupModalReportId(item.id);
                              setGroupTitle("");
                              setGroupModalMode("create");
                              setEditingGroupId(null);
                            }}
                          >
                            Добавить подгруппу
                          </button>
                          <button
                            type="button"
                            className="text-destructive hover:bg-destructive/10 rounded-md px-3 py-2 text-left text-sm"
                            onClick={() => handleDelete(item.id)}
                          >
                            Удалить новость
                          </button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="pl-2">
                  <Accordion
                    type="single"
                    collapsible
                    value={openReportId === item.id ? item.id : undefined}
                    onValueChange={(value) => {
                      const next = value || null;
                      setOpenReportId(next);
                      if (next) {
                        ensureGroupsLoaded(next);
                      }
                    }}
                  >
                    <AccordionItem value={item.id} className="border-none">
                      <AccordionTrigger className="text-muted-foreground text-sm">
                        Подгруппы
                      </AccordionTrigger>
                      <AccordionContent>
                        {loadingGroups[item.id] ? (
                          <p className="text-muted-foreground text-xs">Загрузка...</p>
                        ) : groupsByReport[item.id]?.length ? (
                          <div className="grid gap-2">
                            {groupsByReport[item.id].map((group) => (
                              <div
                                key={group.id}
                                className="border-border/60 rounded-md border px-3 py-2"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="text-sm font-medium">{group.title}</p>
                                    <p className="text-muted-foreground text-xs">ID: {group.id}</p>
                                  </div>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button variant="outline" size="icon" aria-label="Действия">
                                        <MoreHorizontal className="size-4" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent align="end" className="w-56 p-2">
                                      <div className="flex flex-col gap-1">
                                        <button
                                          type="button"
                                          className="hover:bg-accent rounded-md px-3 py-2 text-left text-sm"
                                          onClick={() => {
                                            setGroupModalReportId(item.id);
                                            setGroupTitle(group.title);
                                            setGroupModalMode("edit");
                                            setEditingGroupId(group.id);
                                          }}
                                        >
                                          Редактировать подгруппу
                                        </button>
                                        <button
                                          type="button"
                                          className="hover:bg-accent rounded-md px-3 py-2 text-left text-sm"
                                          onClick={() => {
                                            router.push(
                                              `/news/${item.id}/edit?companyId=${companyId}&groupId=${group.id}&groupTitle=${encodeURIComponent(
                                                group.title
                                              )}&reportDate=${item.date}&action=create-article`
                                            );
                                          }}
                                        >
                                          Добавить статью
                                        </button>
                                        <button
                                          type="button"
                                          className="text-destructive hover:bg-destructive/10 rounded-md px-3 py-2 text-left text-sm"
                                          onClick={() => handleDeleteGroup(item.id, group.id)}
                                        >
                                          Удалить подгруппу
                                        </button>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                                <Accordion
                                  type="single"
                                  collapsible
                                  value={openGroupId === group.id ? group.id : undefined}
                                  onValueChange={(value) => {
                                    const next = value || null;
                                    setOpenGroupId(next);
                                    if (next) {
                                      ensureArticlesLoaded(item.id, group.id);
                                    }
                                  }}
                                >
                                  <AccordionItem value={group.id} className="border-none">
                                    <AccordionTrigger className="text-muted-foreground text-xs">
                                      Статьи
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      {loadingArticles[group.id] ? (
                                        <p className="text-muted-foreground text-xs">Загрузка...</p>
                                      ) : articlesByGroup[group.id]?.length ? (
                                        <div className="grid gap-2">
                                          {articlesByGroup[group.id].map((article) => (
                                            <div
                                              key={article.id}
                                              className="border-border/60 rounded-md border px-3 py-2 text-sm"
                                            >
                                              <div className="flex items-start justify-between gap-2">
                                                <div>
                                                  <p className="font-medium">{article.title}</p>
                                                  <p className="text-muted-foreground text-xs">
                                                    {article.subtitle}
                                                  </p>
                                                </div>
                                                <Popover>
                                                  <PopoverTrigger asChild>
                                                    <Button
                                                      variant="outline"
                                                      size="icon"
                                                      aria-label="Действия"
                                                    >
                                                      <MoreHorizontal className="size-4" />
                                                    </Button>
                                                  </PopoverTrigger>
                                                  <PopoverContent align="end" className="w-48 p-2">
                                                    <div className="flex flex-col gap-1">
                                                      <button
                                                        type="button"
                                                        className="hover:bg-accent rounded-md px-3 py-2 text-left text-sm"
                                                        onClick={() => {
                                                          router.push(
                                                            `/news/${item.id}/edit?companyId=${companyId}&groupId=${group.id}&groupTitle=${encodeURIComponent(
                                                              group.title
                                                            )}&reportDate=${item.date}&articleId=${article.id}&action=edit-article`
                                                          );
                                                        }}
                                                      >
                                                        Редактировать
                                                      </button>
                                                      <button
                                                        type="button"
                                                        className="text-destructive hover:bg-destructive/10 rounded-md px-3 py-2 text-left text-sm"
                                                        onClick={() =>
                                                          handleDeleteArticle(
                                                            item.id,
                                                            group.id,
                                                            article.id
                                                          )
                                                        }
                                                      >
                                                        Удалить
                                                      </button>
                                                    </div>
                                                  </PopoverContent>
                                                </Popover>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-muted-foreground text-xs">
                                          Статьи не добавлены.
                                        </p>
                                      )}
                                    </AccordionContent>
                                  </AccordionItem>
                                </Accordion>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-xs">Подгруппы не добавлены.</p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
