"use client";

import { useState } from "react";
import { Category } from "@/lib/api";
import { FiChevronRight, FiChevronDown, FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";

interface CategoryTreeItemProps {
  category: Category;
  level: number;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onAddChild: (parentId: string) => void;
}

export default function CategoryTreeItem({
  category,
  level,
  onEdit,
  onDelete,
  onAddChild,
}: CategoryTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div className={level > 0 ? "tree-item" : "tree-item-root"}>
      <div className="flex items-center gap-2 py-2 px-2 hover:bg-gray-50 rounded group">
        {/* Expand/Collapse button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-5 h-5 flex items-center justify-center text-gray-400"
        >
          {hasChildren ? (
            isExpanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />
          ) : (
            <span className="w-3.5" />
          )}
        </button>

        {/* Category name */}
        <span className="flex-1 text-sm">{category.name}</span>

        {/* Status badge */}
        {!category.isActive && (
          <span className="text-xs text-gray-400">(ẩn)</span>
        )}

        {/* Actions */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
          <button
            onClick={() => onAddChild(category.id)}
            className="p-1 hover:bg-gray-200 rounded text-gray-500"
            title="Thêm danh mục con"
          >
            <FiPlus size={14} />
          </button>
          <button
            onClick={() => onEdit(category)}
            className="p-1 hover:bg-gray-200 rounded text-gray-500"
            title="Sửa"
          >
            <FiEdit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(category)}
            className="p-1 hover:bg-gray-200 rounded text-red-500"
            title="Xóa"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {category.children!.map((child) => (
            <CategoryTreeItem
              key={child.id}
              category={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}
