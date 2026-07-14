"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { createSalesOrder } from "@/features/sales-orders/actions/order-actions";
import {
  orderFormSchema,
  type OrderFormInput,
} from "@/features/sales-orders/schemas/order-schemas";
import type { QuoteFormData } from "@/features/quotations/types";
import { computeTotals } from "@/features/quotations/utils/totals";
import { formatCurrency } from "@/utils/format";

/**
 * Manual order entry — same option data as the quote form (customers with
 * price levels, active products with both price points).
 */
export function OrderForm({ formData }: { formData: QuoteFormData }) {
  const router = useRouter();

  const form = useForm<OrderFormInput>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customerId: "",
      discount: 0,
      notes: "",
      items: [{ productId: "", quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watched = useWatch({ control: form.control });
  const priceLevel =
    formData.customers.find((c) => c.value === watched.customerId)
      ?.priceLevel ?? "SRP";

  const totals = computeTotals({
    items: (watched.items ?? []).map((item) => ({
      quantity: Number(item?.quantity) || 0,
      unitPrice: Number(item?.unitPrice) || 0,
    })),
    discount: Number(watched.discount) || 0,
  });

  const priceFor = (productId: string) => {
    const product = formData.products.find((p) => p.value === productId);
    if (!product) return 0;
    return priceLevel === "DEALER" ? product.dealerPrice : product.srp;
  };

  const onSubmit = async (values: OrderFormInput) => {
    const result = await createSalesOrder(values);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Sales order created — stock reserved.");
    router.push(`/sales-orders/${result.data.id}`);
    router.refresh();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-6 lg:grid-cols-3"
        noValidate
      >
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Line items</CardTitle>
              <CardDescription>
                Creating the order reserves stock for every line in the default
                warehouse.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-[1fr_84px_120px_36px] items-start gap-2"
                >
                  <FormField
                    control={form.control}
                    name={`items.${index}.productId`}
                    render={({ field: itemField }) => (
                      <FormItem>
                        {index === 0 ? <FormLabel>Product</FormLabel> : null}
                        <Select
                          onValueChange={(value) => {
                            itemField.onChange(value);
                            form.setValue(
                              `items.${index}.unitPrice`,
                              priceFor(value),
                              { shouldValidate: true },
                            );
                          }}
                          value={itemField.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a product" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {formData.products.map((product) => (
                              <SelectItem
                                key={product.value}
                                value={product.value}
                              >
                                {product.label} · {product.sku}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field: itemField }) => (
                      <FormItem>
                        {index === 0 ? <FormLabel>Qty</FormLabel> : null}
                        <FormControl>
                          <Input type="number" min="1" {...itemField} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.unitPrice`}
                    render={({ field: itemField }) => (
                      <FormItem>
                        {index === 0 ? <FormLabel>Unit price</FormLabel> : null}
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...itemField}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className={index === 0 ? "pt-7" : undefined}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remove line"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ productId: "", quantity: 1, unitPrice: 0 })
                }
              >
                <Plus />
                Add line
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Delivery instructions, PO reference…"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {formData.customers.map((customer) => (
                          <SelectItem
                            key={customer.value}
                            value={customer.value}
                          >
                            {customer.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount (₱)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Totals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">
                  {formatCurrency(totals.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span className="tabular-nums">
                  −{formatCurrency(totals.discount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">VAT (12%)</span>
                <span className="tabular-nums">
                  {formatCurrency(totals.tax)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="tabular-nums">
                  {formatCurrency(totals.total)}
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Creating…" : "Create order"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
