import { MarketingLayout } from '../components/marketing-layout';
import { useLanguage } from '../context/language-context';

export default function TermsPage() {
  const { lang } = useLanguage();

  return (
    <MarketingLayout>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-serif text-4xl text-primary mb-3">
          {lang === 'pt' ? 'Termos de Uso' : 'Terms of Service'}
        </h1>
        <p className="text-sm text-muted-foreground mb-10">
          {lang === 'pt' ? 'Última atualização: Julho de 2026' : 'Last updated: July 2026'}
        </p>

        <div className="space-y-8 text-foreground">
          {[
            {
              en: { h: 'Acceptance of Terms', p: 'By downloading BreadLight or accessing this website, you agree to these Terms of Service. If you do not agree, please do not use BreadLight.' },
              pt: { h: 'Aceitação dos Termos', p: 'Ao baixar o BreadLight ou acessar este site, você concorda com estes Termos de Uso. Se não concordar, não use o BreadLight.' },
            },
            {
              en: { h: 'Description of Service', p: 'BreadLight is a mobile application and web service that helps Portuguese speakers learn English through the Bible. Core features are free. Premium features require a paid subscription.' },
              pt: { h: 'Descrição do Serviço', p: 'O BreadLight é um aplicativo móvel e serviço web que ajuda falantes de português a aprender inglês através da Bíblia. Os recursos principais são gratuitos. Os recursos Premium exigem uma assinatura paga.' },
            },
            {
              en: { h: 'User Accounts', p: 'You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials. You must be at least 13 years old to use BreadLight.' },
              pt: { h: 'Contas de Usuário', p: 'Você deve fornecer informações precisas ao criar uma conta. Você é responsável por manter a segurança das credenciais da sua conta. Você deve ter pelo menos 13 anos para usar o BreadLight.' },
            },
            {
              en: { h: 'Subscriptions and Payments', p: 'Premium subscriptions are billed monthly or annually. You may cancel at any time. Refunds are handled according to the platform you subscribed through (Apple App Store, Google Play, or Stripe for web). A 7-day free trial is available for new subscribers.' },
              pt: { h: 'Assinaturas e Pagamentos', p: 'As assinaturas Premium são cobradas mensalmente ou anualmente. Você pode cancelar a qualquer momento. Os reembolsos são tratados de acordo com a plataforma pela qual você assinou (Apple App Store, Google Play ou Stripe para web). Um teste grátis de 7 dias está disponível para novos assinantes.' },
            },
            {
              en: { h: 'Intellectual Property', p: 'The BreadLight app, brand, and content (excluding the KJV Bible text, which is in the public domain) are owned by BreadLight. You may not reproduce, distribute, or create derivative works without our written permission.' },
              pt: { h: 'Propriedade Intelectual', p: 'O aplicativo, a marca e o conteúdo do BreadLight (excluindo o texto da Bíblia KJV, que é de domínio público) são propriedade do BreadLight. Você não pode reproduzir, distribuir ou criar obras derivadas sem nossa permissão por escrito.' },
            },
            {
              en: { h: 'Prohibited Conduct', p: 'You may not use BreadLight to distribute spam, engage in illegal activity, attempt to reverse-engineer the app, or use automated means to access the service at scale without permission.' },
              pt: { h: 'Condutas Proibidas', p: 'Você não pode usar o BreadLight para distribuir spam, realizar atividades ilegais, tentar fazer engenharia reversa do aplicativo, ou usar meios automatizados para acessar o serviço em escala sem permissão.' },
            },
            {
              en: { h: 'Disclaimer of Warranties', p: 'BreadLight is provided "as is" without warranties of any kind. We do not guarantee the service will be uninterrupted, error-free, or meet your specific requirements.' },
              pt: { h: 'Isenção de Garantias', p: 'O BreadLight é fornecido "como está", sem garantias de qualquer tipo. Não garantimos que o serviço será ininterrupto, livre de erros ou atenderá aos seus requisitos específicos.' },
            },
            {
              en: { h: 'Limitation of Liability', p: 'To the maximum extent permitted by law, BreadLight shall not be liable for indirect, incidental, or consequential damages arising from your use of the service.' },
              pt: { h: 'Limitação de Responsabilidade', p: 'Na medida máxima permitida por lei, o BreadLight não será responsável por danos indiretos, incidentais ou consequentes decorrentes do uso do serviço.' },
            },
            {
              en: { h: 'Changes to Terms', p: 'We may update these terms from time to time. Continued use of BreadLight after changes constitutes acceptance of the updated terms.' },
              pt: { h: 'Alterações nos Termos', p: 'Podemos atualizar estes termos periodicamente. O uso continuado do BreadLight após as alterações constitui aceitação dos termos atualizados.' },
            },
            {
              en: { h: 'Contact', p: 'Questions about these terms? Contact us at legal@breadlight.app.' },
              pt: { h: 'Contato', p: 'Perguntas sobre estes termos? Entre em contato em legal@breadlight.app.' },
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
