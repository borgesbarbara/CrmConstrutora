require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Testar configuração do Supabase
const testSupabaseConnection = async () => {
  console.log('🔍 Testando conexão com Supabase...');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  
  console.log('📋 Configuração:');
  console.log('- URL:', supabaseUrl ? '✅ Definida' : '❌ Não definida');
  console.log('- Anon Key:', supabaseAnonKey ? '✅ Definida' : '❌ Não definida');
  console.log('- Service Key:', supabaseServiceKey ? '✅ Definida' : '❌ Não definida');
  
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    console.error('❌ Variáveis do Supabase não configuradas');
    return;
  }
  
  try {
    // Testar cliente anônimo
    console.log('\n🔐 Testando cliente anônimo...');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data: testData, error: testError } = await supabase
      .from('consultores')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erro com cliente anônimo:', testError.message);
    } else {
      console.log('✅ Cliente anônimo funcionando');
    }
    
    // Testar cliente de serviço
    console.log('\n🔑 Testando cliente de serviço...');
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('consultores')
      .select('count')
      .limit(1);
    
    if (adminError) {
      console.error('❌ Erro com cliente de serviço:', adminError.message);
    } else {
      console.log('✅ Cliente de serviço funcionando');
    }
    
    // Verificar se as chaves são diferentes
    if (supabaseAnonKey === supabaseServiceKey) {
      console.warn('⚠️  ATENÇÃO: Anon Key e Service Key são iguais!');
      console.warn('   Isso pode causar problemas de segurança e funcionalidade.');
      console.warn('   Verifique se você está usando a Service Role Key correta.');
    } else {
      console.log('✅ Chaves são diferentes (correto)');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
};

testSupabaseConnection(); 