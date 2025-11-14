"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Settings2, Monitor, Lock, Cookie, Code, Camera, Wifi } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export interface AdvancedScanOptions {
  viewport?: {
    width: number
    height: number
  }
  authentication?: {
    type: 'basic' | 'form' | 'bearer'
    username?: string
    password?: string
    token?: string
    loginUrl?: string
    usernameSelector?: string
    passwordSelector?: string
    submitSelector?: string
  }
  cookies?: Array<{
    name: string
    value: string
    domain?: string
  }>
  customJS?: string
  captureScreenshot?: boolean
  networkThrottling?: {
    downloadSpeed: number // Kbps
    uploadSpeed: number // Kbps
    latency: number // ms
  }
  userAgent?: string
  waitForSelector?: string
  waitTime?: number // ms
}

interface AdvancedScanOptionsProps {
  onOptionsChange: (options: AdvancedScanOptions) => void
  initialOptions?: AdvancedScanOptions
}

export function AdvancedScanOptions({ onOptionsChange, initialOptions }: AdvancedScanOptionsProps) {
  const [options, setOptions] = useState<AdvancedScanOptions>(initialOptions || {})
  const [showSection, setShowSection] = useState<string | null>(null)

  const updateOptions = (newOptions: Partial<AdvancedScanOptions>) => {
    const updated = { ...options, ...newOptions }
    setOptions(updated)
    onOptionsChange(updated)
  }

  const toggleSection = (section: string) => {
    setShowSection(showSection === section ? null : section)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          Advanced Scan Options
        </CardTitle>
        <CardDescription>
          Configure viewport, authentication, cookies, and more for comprehensive testing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Viewport Settings */}
        <div>
          <Button
            variant="ghost"
            onClick={() => toggleSection('viewport')}
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Viewport Size
            </span>
            {options.viewport && <Badge variant="secondary">Configured</Badge>}
          </Button>

          <AnimatePresence>
            {showSection === 'viewport' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-3 pl-6"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Width (px)</label>
                    <Input
                      type="number"
                      value={options.viewport?.width || 1920}
                      onChange={(e) => updateOptions({
                        viewport: { ...options.viewport, width: parseInt(e.target.value) } as any
                      })}
                      placeholder="1920"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Height (px)</label>
                    <Input
                      type="number"
                      value={options.viewport?.height || 1080}
                      onChange={(e) => updateOptions({
                        viewport: { ...options.viewport, height: parseInt(e.target.value) } as any
                      })}
                      placeholder="1080"
                    />
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => updateOptions({ viewport: { width: 1920, height: 1080 } })}>
                    Desktop
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => updateOptions({ viewport: { width: 768, height: 1024 } })}>
                    Tablet
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => updateOptions({ viewport: { width: 375, height: 667 } })}>
                    Mobile
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Separator />

        {/* Authentication */}
        <div>
          <Button
            variant="ghost"
            onClick={() => toggleSection('auth')}
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Authentication
            </span>
            {options.authentication && <Badge variant="secondary">Configured</Badge>}
          </Button>

          <AnimatePresence>
            {showSection === 'auth' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-3 pl-6"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium">Auth Type</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={options.authentication?.type || 'basic'}
                    onChange={(e) => updateOptions({
                      authentication: { ...options.authentication, type: e.target.value as any }
                    })}
                  >
                    <option value="basic">Basic Auth</option>
                    <option value="form">Form Login</option>
                    <option value="bearer">Bearer Token</option>
                  </select>
                </div>

                {options.authentication?.type === 'bearer' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bearer Token</label>
                    <Input
                      type="text"
                      value={options.authentication.token || ''}
                      onChange={(e) => updateOptions({
                        authentication: { ...options.authentication, token: e.target.value, type: 'bearer' }
                      })}
                      placeholder="Enter bearer token"
                    />
                  </div>
                )}

                {(options.authentication?.type === 'basic' || options.authentication?.type === 'form') && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Username</label>
                      <Input
                        type="text"
                        value={options.authentication.username || ''}
                        onChange={(e) => updateOptions({
                          authentication: { type: options.authentication?.type || 'basic', ...options.authentication, username: e.target.value } as any
                        })}
                        placeholder="username"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Password</label>
                      <Input
                        type="password"
                        value={options.authentication.password || ''}
                        onChange={(e) => updateOptions({
                          authentication: { type: options.authentication?.type || 'basic', ...options.authentication, password: e.target.value } as any
                        })}
                        placeholder="password"
                      />
                    </div>
                  </>
                )}

                {options.authentication?.type === 'form' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Login Page URL</label>
                      <Input
                        type="url"
                        value={options.authentication.loginUrl || ''}
                        onChange={(e) => updateOptions({
                          authentication: { type: 'form', ...options.authentication, loginUrl: e.target.value } as any
                        })}
                        placeholder="https://example.com/login"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Username Field Selector</label>
                      <Input
                        type="text"
                        value={options.authentication.usernameSelector || ''}
                        onChange={(e) => updateOptions({
                          authentication: { type: 'form', ...options.authentication, usernameSelector: e.target.value } as any
                        })}
                        placeholder="#username"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Password Field Selector</label>
                      <Input
                        type="text"
                        value={options.authentication.passwordSelector || ''}
                        onChange={(e) => updateOptions({
                          authentication: { type: 'form', ...options.authentication, passwordSelector: e.target.value } as any
                        })}
                        placeholder="#password"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Submit Button Selector</label>
                      <Input
                        type="text"
                        value={options.authentication.submitSelector || ''}
                        onChange={(e) => updateOptions({
                          authentication: { type: 'form', ...options.authentication, submitSelector: e.target.value } as any
                        })}
                        placeholder="button[type='submit']"
                      />
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Separator />

        {/* Cookies */}
        <div>
          <Button
            variant="ghost"
            onClick={() => toggleSection('cookies')}
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <Cookie className="h-4 w-4" />
              Cookies
            </span>
            {options.cookies && options.cookies.length > 0 && (
              <Badge variant="secondary">{options.cookies.length} cookie(s)</Badge>
            )}
          </Button>

          <AnimatePresence>
            {showSection === 'cookies' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-3 pl-6"
              >
                <p className="text-xs text-muted-foreground">
                  Add cookies in JSON format: {"[{\"name\": \"session\", \"value\": \"abc123\"}]"}
                </p>
                <textarea
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder='[{"name": "session", "value": "abc123", "domain": ".example.com"}]'
                  value={JSON.stringify(options.cookies || [], null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value)
                      updateOptions({ cookies: parsed })
                    } catch (err) {
                      // Invalid JSON, ignore
                    }
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Separator />

        {/* Custom JavaScript */}
        <div>
          <Button
            variant="ghost"
            onClick={() => toggleSection('customjs')}
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Custom JavaScript
            </span>
            {options.customJS && <Badge variant="secondary">Configured</Badge>}
          </Button>

          <AnimatePresence>
            {showSection === 'customjs' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-3 pl-6"
              >
                <p className="text-xs text-muted-foreground">
                  JavaScript to execute before scanning (e.g., close modals, set state)
                </p>
                <textarea
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                  placeholder="document.querySelector('.modal').style.display = 'none';"
                  value={options.customJS || ''}
                  onChange={(e) => updateOptions({ customJS: e.target.value })}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Separator />

        {/* Screenshot */}
        <div>
          <Button
            variant="ghost"
            onClick={() => updateOptions({ captureScreenshot: !options.captureScreenshot })}
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Capture Screenshot
            </span>
            <Badge variant={options.captureScreenshot ? "default" : "secondary"}>
              {options.captureScreenshot ? 'Enabled' : 'Disabled'}
            </Badge>
          </Button>
        </div>

        <Separator />

        {/* Network Throttling */}
        <div>
          <Button
            variant="ghost"
            onClick={() => toggleSection('network')}
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              Network Throttling
            </span>
            {options.networkThrottling && <Badge variant="secondary">Configured</Badge>}
          </Button>

          <AnimatePresence>
            {showSection === 'network' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-3 pl-6"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium">Download Speed (Kbps)</label>
                  <Input
                    type="number"
                    value={options.networkThrottling?.downloadSpeed || 1000}
                    onChange={(e) => updateOptions({
                      networkThrottling: {
                        ...options.networkThrottling,
                        downloadSpeed: parseInt(e.target.value)
                      } as any
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Upload Speed (Kbps)</label>
                  <Input
                    type="number"
                    value={options.networkThrottling?.uploadSpeed || 500}
                    onChange={(e) => updateOptions({
                      networkThrottling: {
                        ...options.networkThrottling,
                        uploadSpeed: parseInt(e.target.value)
                      } as any
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Latency (ms)</label>
                  <Input
                    type="number"
                    value={options.networkThrottling?.latency || 50}
                    onChange={(e) => updateOptions({
                      networkThrottling: {
                        ...options.networkThrottling,
                        latency: parseInt(e.target.value)
                      } as any
                    })}
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateOptions({ networkThrottling: { downloadSpeed: 50000, uploadSpeed: 10000, latency: 20 } })}
                  >
                    Fast 4G
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateOptions({ networkThrottling: { downloadSpeed: 1600, uploadSpeed: 750, latency: 150 } })}
                  >
                    Slow 3G
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateOptions({ networkThrottling: undefined })}
                  >
                    No Throttling
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Separator />

        {/* Other Options */}
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">User Agent</label>
            <Input
              type="text"
              value={options.userAgent || ''}
              onChange={(e) => updateOptions({ userAgent: e.target.value })}
              placeholder="Custom user agent string (optional)"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Wait for Selector</label>
            <Input
              type="text"
              value={options.waitForSelector || ''}
              onChange={(e) => updateOptions({ waitForSelector: e.target.value })}
              placeholder=".content-loaded (optional)"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Wait Time (ms)</label>
            <Input
              type="number"
              value={options.waitTime || 0}
              onChange={(e) => updateOptions({ waitTime: parseInt(e.target.value) })}
              placeholder="0"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
