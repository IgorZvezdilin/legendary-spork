import { Newspaper } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function EmptyInfo() {
  return (
    <Empty className="flex-1">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Newspaper />
        </EmptyMedia>
        <EmptyTitle>Новостей не обнаружено</EmptyTitle>
        <EmptyDescription>
          Попробуйте выбрать другую дату, отчистить фильтры или строку поиска
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
