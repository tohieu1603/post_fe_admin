"use client";

import { useState, useEffect } from "react";
import { Category, categoryApi } from "@/lib/api";
import { FiX } from "react-icons/fi";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editCategory?: Category | null;
  parentId?: string | null;
  allCategories: Category[];
}

export default function CategoryFormModal({
  isOpen,
  onClose,
  onSuccess,
  editCategory,
  parentId,
  allCategories,
}: CategoryFormModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editCategory) {
      setName(editCategory.name);
      setDescription(editCategory.description || "");
      setSelectedParentId(editCategory.parentId);
      setSortOrder(editCategory.sortOrder);
      setIsActive(editCategory.isActive);
    } else {
      setName("");
      setDescription("");
      setSelectedParentId(parentId || null);
      setSortOrder(0);
      setIsActive(true);
    }
    setError("");
  }, [editCategory, parentId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Tên danh mục không được để trống");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = {
        name: name.trim(),
        description: description.trim() || null,
        parentId: selectedParentId,
        sortOrder,
        isActive,
      };

      if (editCategory) {
        await categoryApi.update(editCategory.id, data);
      } else {
        await categoryApi.create(data);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  // Build flat list with indentation for select
  const buildFlatOptions = (
    categories: Category[],
    level = 0,
    excludeId?: string
  ): { id: string; name: string; level: number }[] => {
    const result: { id: string; name: string; level: number }[] = [];
    for (const cat of categories) {
      if (cat.id !== excludeId) {
        result.push({ id: cat.id, name: cat.name, level });
        if (cat.children && cat.children.length > 0) {
          result.push(...buildFlatOptions(cat.children, level + 1, excludeId));
        }
      }
    }
    return result;
  };

  const flatOptions = buildFlatOptions(allCategories, 0, editCategory?.id);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {editCategory ? "Sửa danh mục" : "Thêm danh mục"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên danh mục"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả (tùy chọn)"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Danh mục cha</label>
            <select
              value={selectedParentId || ""}
              onChange={(e) => setSelectedParentId(e.target.value || null)}
            >
              <option value="">-- Không có (danh mục gốc) --</option>
              {flatOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {"─".repeat(opt.level)} {opt.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Thứ tự</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Kích hoạt</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Đang lưu..." : editCategory ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
