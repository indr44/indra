import { useState } from "react";
import SidebarLayout from "@/components/layouts/sidebar-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

type AppSetting = {
  id: string;
  name: string;
  value: string | boolean;
  description: string;
  type: "text" | "number" | "boolean";
};

export default function Settings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AppSetting[]>([
    {
      id: "company_name",
      name: "Nama Perusahaan",
      value: "VoucherStock",
      description: "Nama perusahaan yang akan ditampilkan di aplikasi",
      type: "text",
    },
    {
      id: "offline_mode",
      name: "Mode Offline",
      value: false,
      description: "Aktifkan mode offline untuk karyawan",
      type: "boolean",
    },
    {
      id: "sync_interval",
      name: "Interval Sinkronisasi",
      value: "30",
      description: "Interval sinkronisasi data dalam menit",
      type: "number",
    },
    {
      id: "auto_backup",
      name: "Backup Otomatis",
      value: true,
      description: "Aktifkan backup otomatis data",
      type: "boolean",
    },
  ]);

  const [backupSchedules, setBackupSchedules] = useState([
    {
      id: 1,
      name: "Backup Harian",
      schedule: "Setiap hari pukul 00:00",
      lastRun: "2023-03-30 00:00:00",
      status: "Sukses",
    },
    {
      id: 2,
      name: "Backup Mingguan",
      schedule: "Setiap Minggu pukul 00:00",
      lastRun: "2023-03-26 00:00:00",
      status: "Sukses",
    },
  ]);

  const handleSettingChange = (id: string, value: string | boolean) => {
    // In a real implementation, this would update the setting in the backend
    setSettings(
      settings.map((setting) =>
        setting.id === id ? { ...setting, value } : setting,
      ),
    );

    // Show success toast
    toast({
      title: "Pengaturan disimpan",
      description: "Perubahan pengaturan telah disimpan",
    });

    // In a real implementation, you would persist this to the backend
    // This is where you would add code to ensure data persistence
  };

  return (
    <SidebarLayout title="Pengaturan">
      <div className="space-y-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="general">Umum</TabsTrigger>
            <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Umum</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {settings.map((setting) => (
                    <div
                      key={setting.id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div>
                        <h3 className="font-medium">{setting.name}</h3>
                        <p className="text-sm text-gray-500">
                          {setting.description}
                        </p>
                      </div>

                      {setting.type === "boolean" ? (
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={setting.id}
                            checked={setting.value as boolean}
                            onCheckedChange={(checked) =>
                              handleSettingChange(setting.id, checked)
                            }
                          />
                          <Label htmlFor={setting.id}>
                            {(setting.value as boolean) ? "Aktif" : "Nonaktif"}
                          </Label>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Input
                            id={setting.id}
                            type={setting.type}
                            value={setting.value as string}
                            onChange={(e) =>
                              handleSettingChange(setting.id, e.target.value)
                            }
                            className="w-40"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleSettingChange(
                                setting.id,
                                setting.value as string,
                              )
                            }
                          >
                            Simpan
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backup">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Backup & Restore</CardTitle>
                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">Restore Data</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Restore Data</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <p className="text-sm text-gray-500">
                          Fitur ini akan mengembalikan data dari backup yang
                          dipilih. Semua data saat ini akan diganti dengan data
                          dari backup.
                        </p>
                        <div className="flex flex-col space-y-2">
                          <Label htmlFor="backup-file">File Backup</Label>
                          <Input id="backup-file" type="file" />
                        </div>
                        <Button
                          className="w-full"
                          onClick={() =>
                            toast({
                              title: "Fitur dalam pengembangan",
                              description:
                                "Fitur restore data sedang dalam pengembangan",
                            })
                          }
                        >
                          Restore
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    onClick={() =>
                      toast({
                        title: "Backup dibuat",
                        description: "Backup data berhasil dibuat",
                      })
                    }
                  >
                    Backup Sekarang
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Jadwal</TableHead>
                        <TableHead>Terakhir Dijalankan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {backupSchedules.map((schedule) => (
                        <TableRow key={schedule.id}>
                          <TableCell>{schedule.name}</TableCell>
                          <TableCell>{schedule.schedule}</TableCell>
                          <TableCell>{schedule.lastRun}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${schedule.status === "Sukses" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                            >
                              {schedule.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                toast({
                                  title: "Download backup",
                                  description:
                                    "Fitur download backup sedang dalam pengembangan",
                                })
                              }
                            >
                              Download
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarLayout>
  );
}
