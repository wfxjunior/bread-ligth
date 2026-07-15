import { MarketingLayout } from '../components/marketing-layout';
import { useLanguage } from '../context/language-context';

export default function PrivacyPage() {
  const { lang } = useLanguage();

  return (
    <MarketingLayout>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-serif text-4xl text-primary mb-3">
          {lang === 'pt' ? 'Política de Privacidade' : 'Privacy Policy'}
        </h1>
        <p className="text-sm text-muted-foreground mb-10">
          {lang === 'pt' ? 'Última atualização: Julho de 2026' : 'Last updated: July 2026'}
        </p>

        <div className="prose prose-neutral max-w-none space-y-8 text-foreground">
          {[
            {
              en: { h: 'Overview', p: 'BreadLight ("we", "us", or "our") is committed to protecting your privacy. This policy explains what information we collect, how we use it, and your choices. By using BreadLight you agree to this policy.' },
              pt: { h: 'Visão Geral', p: 'O BreadLight ("nós" ou "nosso") está comprometido em proteger sua privacidade. Esta política explica quais informações coletamos, como as usamos e suas escolhas. Ao usar o BreadLight, você concorda com esta política.' },
            },
            {
              en: { h: 'Information We Collect', p: 'When you create an account, we collect your email address and, optionally, your name. If you subscribe to Premium, our payment processor (Stripe) handles payment details — we never see or store your card number. We may collect anonymous usage data (which screens you visit, which features you use) to improve the app. We do not sell your personal information.' },
              pt: { h: 'Informações que Coletamos', p: 'Quando você cria uma conta, coletamos seu endereço de email e, opcionalmente, seu nome. Se você assinar o Premium, nosso processador de pagamentos (Stripe) cuida dos detalhes — nunca vemos ou armazenamos seu número de cartão. Podemos coletar dados de uso anônimos (quais telas você visita, quais recursos usa) para melhorar o aplicativo. Não vendemos suas informações pessoais.' },
            },
            {
              en: { h: 'How We Use Your Information', p: 'We use your information to operate BreadLight, manage your account and subscription, send important service communications, and improve the app. We do not use your information for advertising purposes.' },
              pt: { h: 'Como Usamos Suas Informações', p: 'Usamos suas informações para operar o BreadLight, gerenciar sua conta e assinatura, enviar comunicações importantes sobre o serviço, e melhorar o aplicativo. Não usamos suas informações para fins publicitários.' },
            },
            {
              en: { h: 'Third-Party Services', p: 'We use Clerk for authentication and Stripe for payment processing. Both are industry-standard services with their own privacy policies. We also use RevenueCat for in-app purchase management on mobile.' },
              pt: { h: 'Serviços de Terceiros', p: 'Usamos o Clerk para autenticação e o Stripe para processamento de pagamentos. Ambos são serviços padrão do setor com suas próprias políticas de privacidade. Também usamos o RevenueCat para gerenciamento de compras no aplicativo móvel.' },
            },
            {
              en: { h: 'Data Security', p: 'We use industry-standard security measures to protect your data. Your password is never stored in plain text. We use HTTPS for all communications between the app and our servers.' },
              pt: { h: 'Segurança dos Dados', p: 'Usamos medidas de segurança padrão do setor para proteger seus dados. Sua senha nunca é armazenada em texto simples. Usamos HTTPS para todas as comunicações entre o aplicativo e nossos servidores.' },
            },
            {
              en: { h: 'Your Rights', p: 'You may access, update, or delete your personal information at any time from your account settings. You may also contact us at privacy@breadlight.app to request data deletion or a copy of your data.' },
              pt: { h: 'Seus Direitos', p: 'Você pode acessar, atualizar ou excluir suas informações pessoais a qualquer momento nas configurações da sua conta. Você também pode nos contatar em privacy@breadlight.app para solicitar exclusão de dados ou uma cópia dos seus dados.' },
            },
            {
              en: { h: 'Changes to This Policy', p: 'We may update this policy from time to time. We will notify you of significant changes via email or an in-app notice. Continued use of BreadLight after changes constitutes acceptance of the updated policy.' },
              pt: { h: 'Alterações nesta Política', p: 'Podemos atualizar esta política periodicamente. Notificaremos você sobre mudanças significativas por email ou aviso no aplicativo. O uso continuado do BreadLight após as alterações constitui aceitação da política atualizada.' },
            },
            {
              en: { h: 'Contact', p: 'Questions about this policy? Contact us at privacy@breadlight.app.' },
              pt: { h: 'Contato', p: 'Perguntas sobre esta política? Entre em contato em privacy@breadlight.app.' },
            },
          ].map((section, i) => {
            const s = lang === 'pt' ? section.pt : section.en;
            return (
              <div key={i}>
                <h2 className="font-serif text-xl text-foreground mb-2">{s.h}</h2>
                <p className="text-muted-foreground leading-relaxed text-sm">{s.p}</p>
              </div>
            );
          })}
        </div>
      </div>
    </MarketingLayout>
  );
}
