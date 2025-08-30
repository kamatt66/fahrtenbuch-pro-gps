import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Euro,
  Calendar,
  Receipt,
  TrendingUp,
  PieChart,
  Car,
  Filter
} from 'lucide-react';
import { useCosts, COST_CATEGORIES, RECURRING_INTERVALS, Cost } from '@/hooks/useCosts';
import { toast } from 'sonner';

const CostManagement = () => {
  const { 
    costs, 
    loading, 
    addCost, 
    updateCost, 
    deleteCost, 
    getCostsByCategory,
    getTotalCosts,
    getCostStatistics 
  } = useCosts();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [editingCost, setEditingCost] = useState<Cost | null>(null);
  
  const [newCost, setNewCost] = useState({
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    receipt_number: '',
    notes: '',
    vehicle_id: '',
    is_recurring: false,
    recurring_interval: ''
  });

  const statistics = getCostStatistics();
  const filteredCosts = selectedCategory ? getCostsByCategory(selectedCategory) : costs;

  const handleAddCost = async () => {
    if (!newCost.category || !newCost.description || !newCost.amount) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    try {
      await addCost({
        category: newCost.category,
        description: newCost.description,
        amount: parseFloat(newCost.amount),
        date: newCost.date,
        vendor: newCost.vendor || null,
        receipt_number: newCost.receipt_number || null,
        notes: newCost.notes || null,
        vehicle_id: newCost.vehicle_id || null,
        is_recurring: newCost.is_recurring,
        recurring_interval: newCost.is_recurring ? newCost.recurring_interval || null : null
      });

      setNewCost({
        category: '',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        vendor: '',
        receipt_number: '',
        notes: '',
        vehicle_id: '',
        is_recurring: false,
        recurring_interval: ''
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleEditCost = (cost: Cost) => {
    setEditingCost({
      ...cost,
      date: cost.date.split('T')[0] // Format date for input
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateCost = async () => {
    if (!editingCost) return;

    try {
      await updateCost(editingCost.id, {
        category: editingCost.category,
        description: editingCost.description,
        amount: parseFloat(editingCost.amount.toString()),
        date: editingCost.date,
        vendor: editingCost.vendor || null,
        receipt_number: editingCost.receipt_number || null,
        notes: editingCost.notes || null,
        vehicle_id: editingCost.vehicle_id || null,
        is_recurring: editingCost.is_recurring,
        recurring_interval: editingCost.is_recurring ? editingCost.recurring_interval || null : null
      });

      setEditingCost(null);
      setIsEditDialogOpen(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDeleteCost = async (costId: string) => {
    if (window.confirm('Sind Sie sicher, dass Sie diese Kostenposition löschen möchten?')) {
      await deleteCost(costId);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: string } = {
      'Wartung': '🔧',
      'Reparatur': '🛠️',
      'Versicherung': '🛡️',
      'TÜV/HU': '✅',
      'Reifen': '🛞',
      'Autowäsche': '🧽',
      'Parkgebühren': '🅿️',
      'Maut': '🛣️',
      'Leasing': '📄',
      'Finanzierung': '🏦',
      'Zubehör': '🔩',
      'Sonstiges': '📋'
    };
    return iconMap[category] || '💰';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Laden...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Kostenverwaltung</h1>
          <p className="text-muted-foreground">Verwalten Sie alle Fahrzeugkosten außer Tanken</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-accent text-accent-foreground hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              Kosten hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Neue Kosten hinzufügen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Kategorie*</Label>
                  <Select value={newCost.category} onValueChange={(value) => setNewCost({...newCost, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {COST_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {getCategoryIcon(category)} {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Betrag (€)*</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={newCost.amount}
                    onChange={(e) => setNewCost({...newCost, amount: e.target.value})}
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Beschreibung*</Label>
                <Input
                  id="description"
                  value={newCost.description}
                  onChange={(e) => setNewCost({...newCost, description: e.target.value})}
                  placeholder="z.B. Ölwechsel, Versicherungsbeitrag"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Datum</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newCost.date}
                    onChange={(e) => setNewCost({...newCost, date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="vendor">Anbieter</Label>
                  <Input
                    id="vendor"
                    value={newCost.vendor}
                    onChange={(e) => setNewCost({...newCost, vendor: e.target.value})}
                    placeholder="z.B. ATU, Allianz"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="receipt">Belegnummer</Label>
                <Input
                  id="receipt"
                  value={newCost.receipt_number}
                  onChange={(e) => setNewCost({...newCost, receipt_number: e.target.value})}
                  placeholder="z.B. R-2024-001"
                />
              </div>

              <div>
                <Label htmlFor="vehicle">Fahrzeug</Label>
                <Input
                  id="vehicle"
                  value={newCost.vehicle_id}
                  onChange={(e) => setNewCost({...newCost, vehicle_id: e.target.value})}
                  placeholder="z.B. BMW 320d (B-MW 1234)"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recurring"
                  checked={newCost.is_recurring}
                  onCheckedChange={(checked) => setNewCost({...newCost, is_recurring: !!checked})}
                />
                <Label htmlFor="recurring">Wiederkehrende Kosten</Label>
              </div>

              {newCost.is_recurring && (
                <div>
                  <Label htmlFor="interval">Intervall</Label>
                  <Select value={newCost.recurring_interval} onValueChange={(value) => setNewCost({...newCost, recurring_interval: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {RECURRING_INTERVALS.map(interval => (
                        <SelectItem key={interval} value={interval}>
                          {interval}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="notes">Notizen</Label>
                <Textarea
                  id="notes"
                  value={newCost.notes}
                  onChange={(e) => setNewCost({...newCost, notes: e.target.value})}
                  placeholder="Zusätzliche Informationen..."
                  rows={3}
                />
              </div>

              <Button onClick={handleAddCost} className="w-full">
                Kosten hinzufügen
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamtkosten</CardTitle>
            <Euro className="h-4 w-4 text-automotive-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(statistics.totalCosts)}</div>
            <p className="text-xs text-muted-foreground">{statistics.costCount} Einträge</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diesen Monat</CardTitle>
            <Calendar className="h-4 w-4 text-automotive-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(statistics.thisMonthTotal)}</div>
            <p className="text-xs text-muted-foreground">Laufender Monat</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dieses Jahr</CardTitle>
            <TrendingUp className="h-4 w-4 text-automotive-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(statistics.thisYearTotal)}</div>
            <p className="text-xs text-muted-foreground">Laufendes Jahr</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wiederkehrend</CardTitle>
            <Receipt className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.recurringCosts.length}</div>
            <p className="text-xs text-muted-foreground">Abonnements</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === '' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('')}
            >
              Alle ({costs.length})
            </Button>
            {COST_CATEGORIES.map(category => {
              const categoryCount = getCostsByCategory(category).length;
              if (categoryCount === 0) return null;
              return (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {getCategoryIcon(category)} {category} ({categoryCount})
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Cost List */}
      <div className="space-y-4">
        {filteredCosts.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Euro className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">
                  {selectedCategory ? `Keine ${selectedCategory}-Kosten` : 'Noch keine Kosten'}
                </h3>
                <p className="text-muted-foreground">
                  {selectedCategory 
                    ? `Fügen Sie ${selectedCategory}-Kosten hinzu oder wählen Sie eine andere Kategorie`
                    : 'Fügen Sie Ihre erste Kostenposition hinzu'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredCosts.map((cost) => (
            <Card key={cost.id} className="hover:shadow-card transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getCategoryIcon(cost.category)}</span>
                      <Badge variant="outline">{cost.category}</Badge>
                      {cost.is_recurring && (
                        <Badge className="bg-warning/20 text-warning border-warning/30">
                          {cost.recurring_interval}
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="font-medium text-lg">{cost.description}</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(cost.date)}
                      </div>
                      {cost.vendor && (
                        <div className="flex items-center gap-1">
                          <Receipt className="w-3 h-3" />
                          {cost.vendor}
                        </div>
                      )}
                      {cost.receipt_number && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs">#</span>
                          {cost.receipt_number}
                        </div>
                      )}
                      {cost.vehicle_id && (
                        <div className="flex items-center gap-1">
                          <Car className="w-3 h-3" />
                          {cost.vehicle_id}
                        </div>
                      )}
                    </div>
                    
                    {cost.notes && (
                      <p className="text-sm text-muted-foreground mt-2 bg-muted/30 p-2 rounded">
                        {cost.notes}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-automotive-accent">
                      {formatCurrency(Number(cost.amount))}
                    </div>
                    <div className="flex gap-1 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCost(cost)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCost(cost.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Cost Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kosten bearbeiten</DialogTitle>
          </DialogHeader>
          {editingCost && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-category">Kategorie*</Label>
                  <Select 
                    value={editingCost.category} 
                    onValueChange={(value) => setEditingCost({...editingCost, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COST_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {getCategoryIcon(category)} {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-amount">Betrag (€)*</Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    step="0.01"
                    value={editingCost.amount}
                    onChange={(e) => setEditingCost({...editingCost, amount: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-description">Beschreibung*</Label>
                <Input
                  id="edit-description"
                  value={editingCost.description}
                  onChange={(e) => setEditingCost({...editingCost, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-date">Datum</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editingCost.date}
                    onChange={(e) => setEditingCost({...editingCost, date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-vendor">Anbieter</Label>
                  <Input
                    id="edit-vendor"
                    value={editingCost.vendor || ''}
                    onChange={(e) => setEditingCost({...editingCost, vendor: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-receipt">Belegnummer</Label>
                <Input
                  id="edit-receipt"
                  value={editingCost.receipt_number || ''}
                  onChange={(e) => setEditingCost({...editingCost, receipt_number: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="edit-vehicle">Fahrzeug</Label>
                <Input
                  id="edit-vehicle"
                  value={editingCost.vehicle_id || ''}
                  onChange={(e) => setEditingCost({...editingCost, vehicle_id: e.target.value})}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-recurring"
                  checked={editingCost.is_recurring}
                  onCheckedChange={(checked) => setEditingCost({...editingCost, is_recurring: !!checked})}
                />
                <Label htmlFor="edit-recurring">Wiederkehrende Kosten</Label>
              </div>

              {editingCost.is_recurring && (
                <div>
                  <Label htmlFor="edit-interval">Intervall</Label>
                  <Select 
                    value={editingCost.recurring_interval || ''} 
                    onValueChange={(value) => setEditingCost({...editingCost, recurring_interval: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RECURRING_INTERVALS.map(interval => (
                        <SelectItem key={interval} value={interval}>
                          {interval}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="edit-notes">Notizen</Label>
                <Textarea
                  id="edit-notes"
                  value={editingCost.notes || ''}
                  onChange={(e) => setEditingCost({...editingCost, notes: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                  Abbrechen
                </Button>
                <Button onClick={handleUpdateCost} className="flex-1">
                  Speichern
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CostManagement;