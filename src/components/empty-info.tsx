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
        <EmptyTitle>По указанной дате новостей не обнаружено</EmptyTitle>
        <EmptyDescription>Пожалуйста, выберите другую дату</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
