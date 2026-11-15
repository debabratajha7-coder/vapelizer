"use client";

import { useActionState } from "react";
import { saveBanner, saveCategory, saveProduct } from "@/lib/actions/admin";
import { buttonClass, fieldClass } from "@/lib/styles";
import type { ActionState, CategoryOption, ProductDTO } from "@/lib/types";

const initial: ActionState = { error: "" };

export function ProductForm({
  categories,
  product,
}: {
  categories: CategoryOption[];
  product?: ProductDTO;
}) {
  const [state, action, pending] = useActionState(saveProduct, initial);
  return (
    <form action={action} className="grid max-w-3xl gap-4">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      <label className="text-sm">
        Name
        <input name="name" required defaultValue={product?.name} className={`${fieldClass} mt-1.5`} />
      </label>
      <label className="text-sm">
        Slug
        <input name="slug" defaultValue={product?.slug} placeholder="Generated from the name if empty" className={`${fieldClass} mt-1.5`} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          Brand
          <input name="brand" defaultValue={product?.brand} className={`${fieldClass} mt-1.5`} />
        </label>
        <label className="text-sm">
          Category
          <select name="categoryId" defaultValue={product?.categoryId} className={`${fieldClass} mt-1.5`} required>
            <option value="">Choose</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        <label className="text-sm">
          Price
          <input name="price" type="number" min="1" step="1" required defaultValue={product?.price} className={`${fieldClass} mt-1.5`} />
        </label>
        <label className="text-sm">
          Sale price
          <input name="salePrice" type="number" min="1" step="1" defaultValue={product?.salePrice ?? ""} className={`${fieldClass} mt-1.5`} />
        </label>
        <label className="text-sm">
          Stock
          <input name="stock" type="number" min="0" required defaultValue={product?.stock ?? 0} className={`${fieldClass} mt-1.5`} />
        </label>
        <label className="text-sm">
          Puff count
          <input name="puffCount" type="number" min="0" defaultValue={product?.puffCount ?? ""} className={`${fieldClass} mt-1.5`} />
        </label>
      </div>
      <label className="text-sm">
        Flavors, comma separated
        <input name="flavors" defaultValue={product?.flavors.join(", ")} className={`${fieldClass} mt-1.5`} />
      </label>
      <label className="text-sm">
        Nicotine strengths, comma separated
        <input name="nicotineStrengths" defaultValue={product?.nicotineStrengths.join(", ")} className={`${fieldClass} mt-1.5`} />
      </label>
      <label className="text-sm">
        Description
        <textarea name="description" rows={4} defaultValue={product?.description} className={`${fieldClass} mt-1.5`} />
      </label>
      <label className="text-sm">
        Rating
        <input name="rating" type="number" min="0" max="5" step="0.1" defaultValue={product?.rating ?? 5} className={`${fieldClass} mt-1.5 max-w-32`} />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="featured" defaultChecked={product?.featured} />
        Featured on the homepage
      </label>
      <label className="text-sm">
        Images
        <input name="images" type="file" accept="image/*" multiple className="mt-1.5 block text-sm" />
      </label>
      <p className="text-xs text-muted">Uploads go to Cloudinary. Products can be saved without photos.</p>
      {state.error ? <p className="text-sm text-ember">{state.error}</p> : null}
      <button className={`${buttonClass} w-fit`} disabled={pending}>
        {pending ? "Saving" : "Save product"}
      </button>
    </form>
  );
}

export function CategoryForm({ categories }: { categories: CategoryOption[] }) {
  const [state, action, pending] = useActionState(saveCategory, initial);
  return (
    <form action={action} className="grid max-w-xl gap-3 rounded-2xl border border-line bg-white p-5">
      <h2 className="font-display text-2xl">New category</h2>
      <input name="name" required placeholder="Name" className={fieldClass} />
      <input name="slug" placeholder="Slug" className={fieldClass} />
      <select name="parentId" className={fieldClass} defaultValue="">
        <option value="">Top level</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.label}
          </option>
        ))}
      </select>
      <input name="sortOrder" type="number" placeholder="Sort order" className={fieldClass} />
      <input name="images" type="file" accept="image/*" />
      {state.error ? <p className="text-sm text-ember">{state.error}</p> : null}
      <button className={`${buttonClass} w-fit`} disabled={pending}>
        {pending ? "Saving" : "Add category"}
      </button>
    </form>
  );
}

export function BannerForm() {
  const [state, action, pending] = useActionState(saveBanner, initial);
  return (
    <form action={action} className="grid max-w-xl gap-3 rounded-2xl border border-line bg-white p-5">
      <h2 className="font-display text-2xl">New banner</h2>
      <input name="eyebrow" placeholder="Eyebrow" className={fieldClass} />
      <input name="title" required placeholder="Title" className={fieldClass} />
      <input name="subtitle" placeholder="Subtitle" className={fieldClass} />
      <input name="href" placeholder="/category/disposable-vape" className={fieldClass} />
      <select name="tone" className={fieldClass} defaultValue="dark">
        <option value="dark">Dark</option>
        <option value="light">Light</option>
      </select>
      <input name="sortOrder" type="number" placeholder="Sort order" className={fieldClass} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked />
        Active
      </label>
      <input name="images" type="file" accept="image/*" />
      {state.error ? <p className="text-sm text-ember">{state.error}</p> : null}
      <button className={`${buttonClass} w-fit`} disabled={pending}>
        {pending ? "Saving" : "Add banner"}
      </button>
    </form>
  );
}
