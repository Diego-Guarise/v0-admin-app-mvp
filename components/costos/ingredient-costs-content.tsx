'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Search, 
  ArrowLeft,
  FileText,
  FileX,
  Calendar,
  Building,
  Info,
  Plus
} from 'lucide-react'
import { 
  INGREDIENT_COSTS, 
  INGREDIENT_INPUTS,
  formatCurrencyDecimal, 
  formatDate,
  formatNumber 
} from '@/lib/mock-data'
import { INGREDIENT_CATEGORY_LABELS, UNIT_OF_MEASURE_ABBR, type IngredientCategory } from '@/lib/types'
import type { IngredientCost } from '@/lib/types'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { CreateCostRegistrationModal } from './create-cost-registration-modal'

export function IngredientCostsContent() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [invoiceFilter, setInvoiceFilter] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [costs, setCosts] = useState<IngredientCost[]>(INGREDIENT_COSTS)

  // Filter costs
  const filteredCosts = useMemo(() => {
    return costs.filter(cost => {
      // Category filter
      if (categoryFilter !== 'all') {
        const insumo = INGREDIENT_INPUTS.find(i => i.id === cost.insumo_id)
        if (insumo?.category !== categoryFilter) return false
      }

      // Invoice filter
      if (invoiceFilter === 'with' && !cost.has_invoice) return false
      if (invoiceFilter === 'without' && cost.has_invoice) return false

      // Search filter
      if (search) {
        const searchLower = search.toLowerCase()
        return (
          cost.insumo?.name.toLowerCase().includes(searchLower) ||
          cost.provider?.toLowerCase().includes(searchLower) ||
          cost.notes?.toLowerCase().includes(searchLower)
        )
      }

      return true
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [search, categoryFilter, invoiceFilter, costs])

  // Stats
  const stats = useMemo(() => {
    const withInvoice = filteredCosts.filter(c => c.has_invoice)
    const withoutInvoice = filteredCosts.filter(c => !c.has_invoice)
    return {
      total: filteredCosts.length,
      totalAmount: filteredCosts.reduce((sum, c) => sum + c.total_amount, 0),
      totalIVA: filteredCosts.reduce((sum, c) => sum + c.iva, 0),
      withInvoice: withInvoice.length,
      withoutInvoice: withoutInvoice.length,
    }
  }, [filteredCosts])

  return (
    <div className="px-4 lg:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/costos">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <PageHeader 
            title="Registro de Costos"
            description="Historial de compras de insumos con desglose de IVA"
          />
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva compra
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-sm">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Registros</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Total compras</p>
            <p className="text-2xl font-bold text-primary">{formatCurrencyDecimal(stats.totalAmount)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">IVA deducido</p>
            <p className="text-2xl font-bold text-emerald-600">{formatCurrencyDecimal(stats.totalIVA)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4 text-emerald-600" />
                <span className="text-sm">{stats.withInvoice}</span>
              </div>
              <span className="text-muted-foreground">/</span>
              <div className="flex items-center gap-1">
                <FileX className="h-4 w-4 text-slate-400" />
                <span className="text-sm">{stats.withoutInvoice}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Con / Sin factura</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por insumo, proveedor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {Object.entries(INGREDIENT_CATEGORY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Invoice filter */}
            <Select value={invoiceFilter} onValueChange={setInvoiceFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Factura" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="with">Con factura</SelectItem>
                <SelectItem value="without">Sin factura</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Costs Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Insumo</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-center">Factura</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Sin IVA</TableHead>
                  <TableHead className="text-right">IVA</TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      Costo/u
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Costo unitario sin IVA
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCosts.map(cost => (
                  <TableRow key={cost.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{formatDate(cost.date)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{cost.insumo?.name}</p>
                        <Badge variant="outline" className="text-xs mt-0.5">
                          {cost.insumo?.category && INGREDIENT_CATEGORY_LABELS[cost.insumo.category as IngredientCategory]}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {cost.provider ? (
                        <div className="flex items-center gap-1">
                          <Building className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{cost.provider}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNumber(cost.quantity, 0)} {UNIT_OF_MEASURE_ABBR[cost.unit_of_measure]}
                    </TableCell>
                    <TableCell className="text-center">
                      {cost.has_invoice ? (
                        <Tooltip>
                          <TooltipTrigger>
                            <FileText className="h-4 w-4 text-emerald-600 mx-auto" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Con factura - IVA deducible
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger>
                            <FileX className="h-4 w-4 text-slate-400 mx-auto" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Sin factura - Sin IVA
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      {formatCurrencyDecimal(cost.total_amount)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrencyDecimal(cost.amount_without_iva)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {cost.iva > 0 ? (
                        <span className="text-emerald-600">{formatCurrencyDecimal(cost.iva)}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <p className="font-mono font-semibold text-primary">
                        {formatCurrencyDecimal(cost.unit_cost_without_iva)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        /{UNIT_OF_MEASURE_ABBR[cost.unit_of_measure]}
                      </p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TooltipProvider>

          {filteredCosts.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No se encontraron registros de costos</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Cost Modal */}
      <CreateCostRegistrationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateCost={(newCost) => {
          setCosts(prev => [newCost, ...prev])
        }}
      />
    </div>
  )
}
