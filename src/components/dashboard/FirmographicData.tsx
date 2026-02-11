'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FirmographicData as FirmographicDataType } from '@/lib/types';
import {
  Building2,
  Briefcase,
  Users,
  Calendar,
  MapPin,
  DollarSign,
  Globe
} from 'lucide-react';

interface FirmographicDataProps {
  data: FirmographicDataType;
}

export function FirmographicData({ data }: FirmographicDataProps) {
  const fields = [
    { label: 'Company Name', value: data.companyName, icon: Building2 },
    { label: 'Industry', value: data.industry, icon: Briefcase },
    { label: 'Employee Count', value: data.employeeCount, icon: Users },
    { label: 'Founded', value: data.foundedYear, icon: Calendar },
    { label: 'Headquarters', value: data.headquarters, icon: MapPin },
    { label: 'Revenue Range', value: data.revenue, icon: DollarSign },
    { label: 'Website', value: data.website, icon: Globe }
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Firmographic Data</h3>
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => {
              if (!field.value) return null;

              const Icon = field.icon;
              return (
                <div key={field.label} className="flex items-start gap-3">
                  <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {field.label}
                    </p>
                    <p className="text-sm font-semibold">
                      {field.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
