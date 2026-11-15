import { CategoryForm } from "@/components/admin-forms";
import { deleteCategory } from "@/lib/actions/admin";
import { getCategoryOptions, getCategoryTree } from "@/lib/catalog";
import type { CategoryNode } from "@/lib/types";

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const [tree, options] = await Promise.all([getCategoryTree(), getCategoryOptions()]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <h1 className="font-display text-4xl">Categories</h1>
        {error === "in-use" ? <p className="mt-3 text-sm text-ember">Remove products and child categories before deleting that category.</p> : null}
        <ul className="mt-6 space-y-4">
          {tree.map((category) => (
            <li key={category.id}>
              <CategoryRow category={category} />
              <ul className="mt-2 space-y-2 pl-4">
                {category.children.map((child) => (
                  <li key={child.id}>
                    <CategoryRow category={child} />
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
      <CategoryForm categories={options} />
    </div>
  );
}

function CategoryRow({ category }: { category: CategoryNode }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-line bg-white px-4 py-3 text-sm">
      <span>{category.name}</span>
      <form action={deleteCategory}>
        <input type="hidden" name="id" value={category.id} />
        <button className="text-ember">Delete</button>
      </form>
    </div>
  );
}
