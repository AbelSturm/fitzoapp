<script lang="ts">
  import { _ } from 'svelte-i18n';
</script>

<div class="container mx-auto px-4 py-12 max-w-4xl">
  <h1 class="text-3xl font-bold mb-8 text-center">
    {$_('privacy.title', { default: 'Privacy Policy' })}
  </h1>
  
  <div class="bg-white shadow-sm rounded-lg p-8">
    <section class="mb-8">
      <h2 class="text-xl font-semibold mb-4">
        {$_('privacy.section1.title', { default: '1. Information We Collect' })}
      </h2>
      <p class="mb-4">
        {$_('privacy.section1.intro', { default: 'At Fitzio, we are committed to protecting your privacy. We collect the following information:' })}
      </p>
      <ul class="list-disc pl-6 space-y-2">
        <li>{$_('privacy.section1.item1', { default: 'Registration information (name, email, password)' })}</li>
        <li>{$_('privacy.section1.item2', { default: 'Profile information (username, role, physical data)' })}</li>
        <li>{$_('privacy.section1.item3', { default: 'Training data and physical progress' })}</li>
        <li>{$_('privacy.section1.item4', { default: 'App usage information' })}</li>
      </ul>
    </section>
    
    <section class="mb-8">
      <h2 class="text-xl font-semibold mb-4">
        {$_('privacy.section2.title', { default: '2. How We Use Your Information' })}
      </h2>
      <p class="mb-4">
        {$_('privacy.section2.intro', { default: 'We use the collected information to:' })}
      </p>
      <ul class="list-disc pl-6 space-y-2">
        <li>{$_('privacy.section2.item1', { default: 'Provide and improve our services' })}</li>
        <li>{$_('privacy.section2.item2', { default: 'Personalize your training experience' })}</li>
        <li>{$_('privacy.section2.item3', { default: 'Enable communication between trainers and athletes' })}</li>
        <li>{$_('privacy.section2.item4', { default: 'Analyze trends and improve the platform' })}</li>
        <li>{$_('privacy.section2.item5', { default: 'Send important notifications about your account' })}</li>
      </ul>
    </section>
    
    <section class="mb-8">
      <h2 class="text-xl font-semibold mb-4">
        {$_('privacy.section3.title', { default: '3. Data Sharing' })}
      </h2>
      <p class="mb-4">
        {$_('privacy.section3.intro', { default: 'We do not sell your personal information to third parties. We share information in the following circumstances:' })}
      </p>
      <ul class="list-disc pl-6 space-y-2">
        <li>{$_('privacy.section3.item1', { default: 'Between trainers and athletes who are connected on the platform' })}</li>
        <li>{$_('privacy.section3.item2', { default: 'With service providers who help us operate the platform' })}</li>
        <li>{$_('privacy.section3.item3', { default: 'When required by law or to protect our rights' })}</li>
      </ul>
    </section>
    
    <section class="mb-8">
      <h2 class="text-xl font-semibold mb-4">
        {$_('privacy.section4.title', { default: '4. Data Security' })}
      </h2>
      <p class="mb-4">
        {$_('privacy.section4.content', { default: 'We implement technical and organizational security measures to protect your personal data against unauthorized access, alteration, disclosure or destruction.' })}
      </p>
    </section>
    
    <section class="mb-8">
      <h2 class="text-xl font-semibold mb-4">
        {$_('privacy.section5.title', { default: '5. Your Rights' })}
      </h2>
      <p class="mb-4">
        {$_('privacy.section5.intro', { default: 'As a user, you have the right to:' })}
      </p>
      <ul class="list-disc pl-6 space-y-2">
        <li>{$_('privacy.section5.item1', { default: 'Access your personal data' })}</li>
        <li>{$_('privacy.section5.item2', { default: 'Correct inaccurate information' })}</li>
        <li>{$_('privacy.section5.item3', { default: 'Delete your account and associated data' })}</li>
        <li>{$_('privacy.section5.item4', { default: 'Restrict certain data processing' })}</li>
        <li>{$_('privacy.section5.item5', { default: 'Request a copy of your data' })}</li>
      </ul>
    </section>
    
    <section class="mb-8">
      <h2 class="text-xl font-semibold mb-4">
        {$_('privacy.section6.title', { default: '6. Cookies and Similar Technologies' })}
      </h2>
      <p class="mb-4">
        {$_('privacy.section6.content', { default: 'We use cookies and similar technologies to improve your experience, understand how you use our services, and personalize content.' })}
      </p>
    </section>
    
    <section class="mb-8">
      <h2 class="text-xl font-semibold mb-4">
        {$_('privacy.section7.title', { default: '7. Changes to This Policy' })}
      </h2>
      <p class="mb-4">
        {$_('privacy.section7.content', { default: 'We may update this privacy policy periodically. We will notify you of significant changes through a notice on our application or by email.' })}
      </p>
    </section>
    
    <section>
      <h2 class="text-xl font-semibold mb-4">
        {$_('privacy.section8.title', { default: '8. Contact' })}
      </h2>
      <p>
        {$_('privacy.section8.content', { default: 'If you have questions about this privacy policy or how we handle your data, contact us at:' })} <a href="mailto:privacy@fitzio.com" class="text-purple-700 hover:underline">privacy@fitzio.com</a>
      </p>
    </section>
    
    <div class="mt-8 text-sm text-gray-500">
      <p>{$_('privacy.last_updated', { default: 'Last updated:' })} {new Date().toLocaleDateString()}</p>
    </div>
  </div>
</div> 