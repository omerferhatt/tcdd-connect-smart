import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useKV } from '@/hooks/use-kv'
import TCDDApiService from '@/lib/tcdd-api'
import { toast } from 'sonner'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * API Settings modal: lets user provide a token and test it.
 */
export function ApiSettings({ open, onOpenChange }: Props) {
  const [storedToken, setStoredToken] = useKV<string>('tcdd-token', '')
  const [tokenInput, setTokenInput] = useState(storedToken)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    setTokenInput(storedToken)
    if (storedToken) {
      TCDDApiService.setAuthToken(storedToken)
    }
  }, [storedToken])

  const handleSave = () => {
    const trimmed = tokenInput.trim()
    setStoredToken(trimmed)
    TCDDApiService.setAuthToken(trimmed)
    toast.success('Token kaydedildi')
    onOpenChange(false)
  }

  const handleTest = async () => {
    const token = tokenInput.trim() || storedToken.trim()
    if (!token) {
      toast.error('Lütfen önce bir token girin')
      return
    }
    setTesting(true)
    try {
      TCDDApiService.setAuthToken(token)
      // Lightweight validation call
      const pairs = await TCDDApiService.fetchStationPairs()
      if (pairs && pairs.length > 0) {
        toast.success('Token geçerli (istasyon eşleşmeleri alındı)')
      } else {
        toast.info('Çağrı başarılı ama veri boş döndü; token yine de geçerli görünüyor')
      }
    } catch (e: any) {
      toast.error(`Token doğrulanamadı: ${e?.message || 'Bilinmeyen hata'}`)
    } finally {
      setTesting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>API Ayarları</DialogTitle>
          <DialogDescription>TCDD API erişimi için yetkilendirme token'ı girin.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <label className="text-sm font-medium">VITE_TCDD_TOKEN</label>
          <Input
            placeholder="Token"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            autoComplete="off"
          />
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Kapat</Button>
            <Button variant="ghost" onClick={handleTest} disabled={testing}>
              {testing ? 'Test ediliyor…' : "Token'ı Test Et"}
            </Button>
            <Button onClick={handleSave}>Kaydet</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ApiSettings
