import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import {
  HelpCircle,
  BookOpen,
  MessageCircle,
  Shield,
  Sparkles,
  Mail,
  FileText,
} from "lucide-react";

export default async function HelpPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-1 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5" />
          Centre d&apos;aide
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Comment pouvons-nous vous aider ?
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Guides, instructions et politique d&apos;utilisation d&apos;EDURA
        </p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary grid place-items-center mb-3">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm mb-1">Guide démarrage</h3>
            <p className="text-xs text-muted-foreground">
              Configurer votre établissement en 10 minutes
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 grid place-items-center mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm mb-1">Module IA</h3>
            <p className="text-xs text-muted-foreground">
              Comment fonctionne l&apos;analyse intelligente
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-600 grid place-items-center mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm mb-1">Sécurité & RGPD</h3>
            <p className="text-xs text-muted-foreground">
              Comment vos données sont protégées
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardContent className="p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Instructions d&apos;utilisation
          </h2>
          <div className="space-y-4 text-sm leading-relaxed">
            <Instruction
              title="1. Ajouter des élèves"
              desc="Allez dans la section Élèves et cliquez sur « Ajouter un élève », ou utilisez « Importer Excel » pour ajouter plusieurs élèves d'un coup. Le système accepte les en-têtes en français et en arabe."
            />
            <Instruction
              title="2. Saisir les notes"
              desc="Dans la section Notes, sélectionnez la classe puis tapez les notes directement dans le tableau. Les notes sont sauvegardées automatiquement à chaque sortie de cellule."
            />
            <Instruction
              title="3. Suivre les présences"
              desc="Chaque jour, dans la section Présences, cliquez sur chaque élève pour basculer son statut (Présent → Absent → Retard). Tout est enregistré en temps réel."
            />
            <Instruction
              title="4. Générer un bulletin PDF"
              desc="Allez dans Bulletins, sélectionnez l'élève et le trimestre, puis cliquez sur « Télécharger PDF ». Le bulletin officiel A4 sera prêt en quelques secondes."
            />
            <Instruction
              title="5. Voir le rapport scientifique d'orientation"
              desc="Pour chaque élève, cliquez sur « Rapport » dans la liste. Ce rapport unique analyse les intelligences multiples (théorie de Gardner), prédit les meilleures filières BAC et suggère des métiers et universités adaptés."
            />
            <Instruction
              title="6. Inviter votre équipe"
              desc="En tant que directeur, allez dans Paramètres → Équipe → « Inviter un membre » pour ajouter des professeurs ou secrétaires. Chaque professeur ne voit que ses classes assignées."
            />
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardContent className="p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Questions fréquentes
          </h2>
          <div className="space-y-4 text-sm">
            <FaqItem
              q="Qui peut voir les notes des élèves ?"
              a="Seuls le directeur, les secrétaires et les professeurs assignés à la classe de l'élève peuvent voir ses notes. L'accès est strictement contrôlé."
            />
            <FaqItem
              q="Comment fonctionne l'IA d'EDURA ?"
              a="EDURA utilise un algorithme propriétaire qui croise notes, absences, paiements et observations enseignants pour détecter automatiquement les élèves à risque de décrochage. Les scores sont recalculés chaque nuit."
            />
            <FaqItem
              q="Mes données sont-elles sécurisées ?"
              a="Oui. Vos données sont hébergées en Europe (RGPD-compliant), chiffrées au repos, et chaque école n'a accès qu'à ses propres données. Sauvegardes quotidiennes automatiques."
            />
            <FaqItem
              q="Puis-je exporter mes données ?"
              a="Oui. Vous pouvez à tout moment télécharger l'ensemble de vos données en format Excel ou CSV depuis chaque module. Pas de vendor lock-in."
            />
            <FaqItem
              q="Combien coûte EDURA ?"
              a="200 000 DZD par an, tout inclus, élèves illimités, modules complets. 30 jours d'essai gratuits sans carte bancaire."
            />
            <FaqItem
              q="Comment fonctionne le rapport scientifique d'orientation ?"
              a="Pour chaque élève, EDURA analyse ses notes, observations enseignants, IQ et intérêts pour calculer son profil d'intelligences multiples selon la théorie de Howard Gardner. Le système recommande ensuite les meilleures filières BAC et les métiers compatibles."
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy policy */}
      <Card>
        <CardContent className="p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Politique de confidentialité
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              EDURA respecte les normes internationales de protection des données
              personnelles (RGPD). Toutes les données scolaires sont la propriété
              exclusive de l&apos;établissement et ne sont jamais partagées avec des
              tiers.
            </p>
            <p>
              <strong className="text-foreground">Données collectées :</strong>{" "}
              informations académiques (notes, présences), administratives
              (paiements), et le cas échéant le score IQ saisi manuellement par
              l&apos;établissement.
            </p>
            <p>
              <strong className="text-foreground">Hébergement :</strong>{" "}
              infrastructure cloud sécurisée en Europe (Supabase Frankfurt /
              Vercel Edge Network).
            </p>
            <p>
              <strong className="text-foreground">Droit à l&apos;oubli :</strong>{" "}
              vous pouvez à tout moment supprimer l&apos;ensemble des données
              d&apos;un élève ou de l&apos;établissement. La suppression est
              définitive et conforme RGPD.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-3 flex-wrap">
            <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground grid place-items-center flex-shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold">Besoin d&apos;une aide supplémentaire ?</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Notre équipe est disponible pour vous accompagner.
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                <a
                  href="mailto:contact@edura.dz"
                  className="text-primary font-medium hover:underline"
                >
                  contact@edura.dz
                </a>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  Réponse sous 24h ouvrées
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Instruction({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="pl-3 border-l-2 border-primary/30">
      <div className="font-semibold text-foreground">{title}</div>
      <p className="text-muted-foreground mt-1 leading-relaxed">{desc}</p>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-lg border bg-muted/20 px-4 py-3 cursor-pointer">
      <summary className="font-semibold list-none flex items-center justify-between">
        <span>{q}</span>
        <span className="text-muted-foreground group-open:rotate-180 transition-transform text-xs">
          ▼
        </span>
      </summary>
      <p className="text-muted-foreground mt-2 leading-relaxed">{a}</p>
    </details>
  );
}
