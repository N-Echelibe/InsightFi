"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-8 w-44 rounded-md bg-muted" />
          <div className="mt-2 h-4 w-72 rounded-md bg-muted" />
        </div>
        <div className="h-10 w-40 rounded-md bg-muted" />
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="h-10 flex-1 rounded-md bg-muted" />
            <div className="h-10 w-full rounded-md bg-muted sm:w-[150px]" />
            <div className="h-10 w-full rounded-md bg-muted sm:w-[180px]" />
            <div className="h-10 w-full rounded-md bg-muted sm:w-[105px]" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="h-6 w-36 rounded-md bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <div className="h-4 w-24 rounded-md bg-muted" />
                  </TableHead>
                  <TableHead>
                    <div className="h-4 w-20 rounded-md bg-muted" />
                  </TableHead>
                  <TableHead>
                    <div className="h-4 w-20 rounded-md bg-muted" />
                  </TableHead>
                  <TableHead>
                    <div className="h-4 w-16 rounded-md bg-muted" />
                  </TableHead>
                  <TableHead>
                    <div className="h-4 w-16 rounded-md bg-muted" />
                  </TableHead>
                  <TableHead className="text-right">
                    <div className="ml-auto h-4 w-20 rounded-md bg-muted" />
                  </TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 8 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-muted" />
                        <div className="h-4 w-40 rounded-md bg-muted" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="h-6 w-28 rounded-full bg-muted" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-28 rounded-md bg-muted" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-24 rounded-md bg-muted" />
                    </TableCell>
                    <TableCell>
                      <div className="h-6 w-24 rounded-full bg-muted" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="ml-auto h-4 w-24 rounded-md bg-muted" />
                    </TableCell>
                    <TableCell>
                      <div className="h-8 w-8 rounded-md bg-muted" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
