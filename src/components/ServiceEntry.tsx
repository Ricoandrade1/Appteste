import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getServices, getProducts } from "@/integrations/firebase/firebase-db";
import { ServiceType, Product } from "@/integrations/firebase/types"; // Import ServiceType and Product

interface ServiceEntryProps {
  onServiceComplete?: (service: any) => void
}

const VAT_RATE = 0.23 // 23% VAT
const COMMISSION_RATE = 0.20 // 20% commission

export function ServiceEntry({ onServiceComplete }: ServiceEntryProps) {
  const [services, setServices] = useState<ServiceType[]>([]);
  const [extraServices, setExtraServices] = useState<ServiceType[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedService, setSelectedService] = useState("")
  const [clientName, setClientName] = useState("")
  const [extraService, setExtraService] = useState("")
  const [selectedProduct, setSelectedProduct] = useState("")
  const [quantity, setQuantity] = useState("1")

  useEffect(() => {
    const fetchServices = async () => {
      const servicesFromFirebase = await getServices();
      if (servicesFromFirebase) {
        setServices(servicesFromFirebase);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    // TODO: Fetch extra services from Firebase if needed, or decide how to handle them
    // For now, keeping them hardcoded as they might be static or less frequently updated
    const hardcodedExtraServices: ServiceType[] = [
      { id: "eyebrows", name: "Tratamento de Sobrancelhas", price: 15 },
      { id: "design-art", name: "Design Artístico", price: 25 },
      { id: "hair-treatment", name: "Tratamento Capilar", price: 30 },
      { id: "color", name: "Coloração", price: 40 },
    ];
    setExtraServices(hardcodedExtraServices);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      const productsFromFirebase = await getProducts();
      if (productsFromFirebase) {
        setProducts(productsFromFirebase);
      }
      console.log("Products array after fetch:", productsFromFirebase); // ADDED CONSOLE LOG
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    console.log("Products array:", products);
  }, [products]);

  const calculateProductPrices = (basePrice: number) => {
    if (isNaN(basePrice)) {
      console.error("Invalid basePrice:", basePrice);
      return { vatAmount: 0, totalPrice: 0, commission: 0 }; // Return 0s to prevent NaN
    }
    const vatAmount = basePrice * VAT_RATE;
    const totalPrice = basePrice + vatAmount;
    const commission = basePrice * COMMISSION_RATE;
    return { vatAmount, totalPrice, commission };
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedService || !clientName) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor preencha todos os campos obrigatórios.",
      })
      return
    }

    const selectedServiceData = services.find(s => s.id === selectedService);
    const serviceDetails = {
      type: selectedService,
      clientName,
      extraService,
      timestamp: new Date().toISOString(),
      price: selectedServiceData?.price || 0,
    };

    try {
      console.log("Service recorded:", serviceDetails)
      
      toast({
        title: "Serviço registrado com sucesso!",
        description: `${selectedServiceData?.name} para ${clientName}`,
      })

      setSelectedService("")
      setClientName("")
      setExtraService("")

      if (onServiceComplete) {
        onServiceComplete(serviceDetails)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao registrar serviço",
        description: "Por favor tente novamente.",
      })
    }
  }

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedProduct || !quantity) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor selecione um produto e quantidade.",
      })
      return
    }

      const product = products.find(p => p.id === selectedProduct)
      if (!product) {
        console.log("Product not found:", selectedProduct, products); // ADDED CONSOLE LOG
        return
      }
      console.log("Selected product:", product); // ADDED CONSOLE LOG

      const { vatAmount, totalPrice, commission } = calculateProductPrices(product.basePrice)
      const productSale = {
        productId: selectedProduct,
        productName: product.name,
        quantity: Number(quantity),
        basePrice: product.basePrice,
        vatAmount,
        totalPrice,
        commission,
        timestamp: new Date().toISOString(),
      }

    try {
      console.log("Product sale recorded:", productSale)
      
      toast({
        title: "Venda registrada com sucesso!",
        description: `${product.name} x${quantity}`,
      })

      setSelectedProduct("")
      setQuantity("1")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao registrar venda",
        description: "Por favor tente novamente.",
      })
    }
  }

  return (
    <Tabs defaultValue="services" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="services">Serviços</TabsTrigger>
        <TabsTrigger value="products">Produtos</TabsTrigger>
      </TabsList>

      <TabsContent value="services">
        <Card className="p-6">
          <form onSubmit={handleServiceSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="service-type">Tipo de Serviço</Label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger id="service-type">
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - €{service.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-name">Nome do Cliente</Label>
              <Input
                id="client-name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nome do cliente"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="extra-service">Serviço Extra</Label>
              <Select value={extraService} onValueChange={setExtraService}>
                <SelectTrigger id="extra-service">
                  <SelectValue placeholder="Selecione o serviço extra (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {extraServices.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - €{service.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full">
              Registrar Serviço
            </Button>
          </form>
        </Card>
      </TabsContent>

      <TabsContent value="products">
        <Card className="p-6">
          <form onSubmit={handleProductSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product-type">Produto</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger id="product-type">
                  <SelectValue placeholder="Selecione o produto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => {
                    const { totalPrice, commission } = calculateProductPrices(product.basePrice)
                    return (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - €{totalPrice.toFixed(2)} (Comissão: €{commission.toFixed(2)})
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="1"
              />
            </div>

            {selectedProduct && (
              <div className="space-y-2 bg-muted p-4 rounded-md">
                <h3 className="font-medium">Detalhes do Produto</h3>
                {(() => {
                  const product = products.find(p => p.id === selectedProduct)
                  if (!product) return null
                  
                  const { vatAmount, totalPrice, commission } = calculateProductPrices(product.basePrice)
                  return (
                    <div className="space-y-1 text-sm">
                      <p>Preço base: €{product.basePrice.toFixed(2)}</p>
                      <p>IVA (23%): €{vatAmount.toFixed(2)}</p>
                      <p>Preço total: €{totalPrice.toFixed(2)}</p>
                      <p>Comissão (20%): €{commission.toFixed(2)}</p>
                      <p>Stock disponível: {product.stock}</p>
                    </div>
                  )
                })()}
              </div>
            )}

            <Button type="submit" className="w-full">
              Registrar Venda
            </Button>
          </form>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
