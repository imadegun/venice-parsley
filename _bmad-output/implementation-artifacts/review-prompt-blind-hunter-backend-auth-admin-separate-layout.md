# Blind Hunter Review Prompt

You are a strict adversarial reviewer.

## Scope
Review ONLY this diff. Do not assume project context. Do not request additional files.

## Diff
```diff
diff --git a/src/app/(admin)/layout.tsx b/src/app/(admin)/layout.tsx
index b5294c1..9b57e86 100644
--- a/src/app/(admin)/layout.tsx
+++ b/src/app/(admin)/layout.tsx
@@ -14,37 +14,31 @@ export default async function AdminLayout({
   }
 
   return (
-    <html lang="en" suppressHydrationWarning>
-      <head>
-        <style>{`
-          .floating-book-button,
-          .floating-menu-button,
-          [class*="floating"],
-          [class*="fixed"]:not(.fixed.left-0) {
-            display: none !important;
-            visibility: hidden !important;
-            pointer-events: none !important;
-          }
-        `}</style>
-      </head>
-      <body className="m-0 p-0 bg-slate-50 min-h-screen overflow-x-hidden">
-        <div className="flex min-h-screen">
-          <AdminSidebar />
-          <main className="flex-1 ml-64 min-h-screen">
-            <div className="bg-white border-b px-8 py-4 shadow-sm">
-              <div className="flex items-center justify-between">
-                <div className="text-sm text-slate-500">Admin Panel</div>
-                <div className="flex items-center gap-4">
-                  <div className="text-sm font-medium text-slate-700">Administrator</div>
-                </div>
+    <div className="m-0 p-0 bg-slate-50 min-h-screen overflow-x-hidden">
+      <style>{`
+        .floating-book-button,
+        .floating-menu-button,
+        [class*="floating"],
+        [class*="fixed"]:not(.fixed.left-0) {
+          display: none !important;
+          visibility: hidden !important;
+          pointer-events: none !important;
+        }
+      `}</style>
+      <div className="flex min-h-screen">
+        <AdminSidebar />
+        <main className="flex-1 ml-64 min-h-screen">
+          <div className="bg-white border-b px-8 py-4 shadow-sm">
+            <div className="flex items-center justify-between">
+              <div className="text-sm text-slate-500">Admin Panel</div>
+              <div className="flex items-center gap-4">
+                <div className="text-sm font-medium text-slate-700">Administrator</div>
               </div>
             </div>
-            <div className="p-8">
-              {children}
-            </div>
-          </main>
-        </div>
-      </body>
-    </html>
+          </div>
+          <div className="p-8">{children}</div>
+        </main>
+      </div>
+    </div>
   )
-}
+}
diff --git a/src/app/(auth)/login/page.tsx b/src/app/(auth)/login/page.tsx
index f68d587..bc14021 100644
--- a/src/app/(auth)/login/page.tsx
+++ b/src/app/(auth)/login/page.tsx
@@ -1,7 +1,6 @@
 'use client'
 
 import { useState } from 'react'
-import Link from 'next/link'
 import { Eye, EyeOff, Loader2 } from 'lucide-react'
@@ -27,12 +26,12 @@ export default function LoginPage({
   }
 
   return (
-    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
-      <Card className="w-full max-w-md">
-        <CardHeader className="space-y-1">
-          <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
+    <div className="min-h-screen flex items-center justify-center bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
+      <Card className="w-full max-w-md border-slate-200 shadow-lg">
+        <CardHeader className="space-y-1 pb-2">
+          <CardTitle className="text-2xl font-semibold text-center text-slate-900">Admin Login</CardTitle>
           <CardDescription className="text-center">
-            Enter your credentials to access your account
+            Enter your credentials to access the dashboard
           </CardDescription>
         </CardHeader>
@@ -99,40 +98,6 @@ export default function LoginPage({
               )}
             </Button>
           </form>
-
-          <div className="mt-6 text-center space-y-2">
-            <p className="text-sm text-gray-600">
-              Don't have an account?{' '}
-              <Link href="/register" className="text-purple-600 hover:text-purple-500 font-medium">
-                Sign up
-              </Link>
-            </p>
-            <p className="text-sm">
-              <Link href="/forgot-password" className="text-purple-600 hover:text-purple-500">
-                Forgot your password?
-              </Link>
-            </p>
-          </div>
-
-          <div className="mt-6">
-            <div className="relative">
-              <div className="absolute inset-0 flex items-center">
-                <div className="w-full border-t border-gray-300" />
-              </div>
-              <div className="relative flex justify-center text-sm">
-                <span className="px-2 bg-white text-gray-500">Or continue as guest</span>
-              </div>
-            </div>
-
-            <Button
-              variant="outline"
-              className="w-full mt-4"
-              onClick={() => router.push('/treatments')}
-              disabled={isLoading}
-            >
-              Browse Treatments
-            </Button>
-          </div>
         </CardContent>
       </Card>
     </div>
diff --git a/src/app/layout.tsx b/src/app/layout.tsx
index e8d7664..f56d5fa 100644
--- a/src/app/layout.tsx
+++ b/src/app/layout.tsx
@@ -1,8 +1,7 @@
 import type { Metadata } from "next";
 import { Josefin_Sans, Montserrat, Bebas_Neue, Mulish, Yellowtail } from "next/font/google";
 import "./globals.css";
-import { Header } from "@/components/layout/header";
-import { Footer } from "@/components/layout/footer";
+import { RouteShell } from "@/components/layout/route-shell";
@@ -45,29 +44,15 @@ export const metadata: Metadata = {
   description: "Discover unique artistic apartments in Venice. Luxury accommodations designed for art lovers, creative souls, and discerning travelers.",
 };
 
-import { headers } from 'next/headers'
-
-export default async function RootLayout({
+export default function RootLayout({
   children,
 }: Readonly<{
   children: React.ReactNode;
 }>) {
-  const headersList = await headers()
-  const pathname = headersList.get('x-next-pathname') || ''
-  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/login') || pathname.startsWith('/register')
-
   return (
     <html lang="en" className={`${josefinSans.variable} ${montserrat.variable} ${bebasNeue.variable} ${mulish.variable} ${yellowtail.variable}`}>
-      <body className={`${mulish.className} antialiased min-h-screen ${!isAdminRoute ? 'flex flex-col font-body' : ''}`}>
-        {!isAdminRoute && <Header />}
-        {!isAdminRoute ? (
-          <main className="flex-1">
-            {children}
-          </main>
-        ) : (
-          children
-        )}
-        {!isAdminRoute && <Footer />}
+      <body className={`${mulish.className} antialiased min-h-screen flex flex-col font-body`}>
+        <RouteShell>{children}</RouteShell>
       </body>
     </html>
   );
 }
```

## Output format
Return a concise findings list:
- `severity` (high|medium|low)
- `file`
- `issue`
- `evidence`
- `why it matters`
- `suggested fix`
Only report real defects in this diff.