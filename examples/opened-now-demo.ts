/**
 * Demonstração - Funcionalidade openedNow
 * 
 * Este exemplo demonstra como usar a nova funcionalidade openedNow
 * que retorna automaticamente o status atual baseado no timezone configurado.
 */

import { 
  HorarioComercial, 
  setTimezone, 
  getCurrentTimezone,
  getTimeInTimezone,
  getDayNameInTimezone 
} from '../dist/index.js';

async function demonstrateOpenedNow() {
  console.log('🚀 Demonstração da Funcionalidade openedNow\n');

  // 1. Configurar timezone
  console.log('🌍 1. Configuração de Timezone');
  setTimezone('America/Sao_Paulo');
  console.log(`   Timezone atual: ${getCurrentTimezone()}`);
  console.log(`   Hora atual: ${getTimeInTimezone()}`);
  console.log(`   Dia atual: ${getDayNameInTimezone()}\n`);

  // 2. Criar instância do HorarioComercial
  console.log('🏢 2. Configuração do Horário Comercial');
  const horario = new HorarioComercial({
    segunda: { abertura: '08:00', fechamento: '18:00' },
    terca: { abertura: '08:00', fechamento: '18:00' },
    quarta: { abertura: '08:00', fechamento: '18:00' },
    quinta: { abertura: '08:00', fechamento: '18:00' },
    sexta: { abertura: '08:00', fechamento: '18:00' },
    sabado: { abertura: '09:00', fechamento: '13:00' }
  });
  console.log('   ✅ Horário comercial configurado\n');

  // 3. Demonstração da funcionalidade openedNow
  console.log('✨ 3. Funcionalidade openedNow');
  console.log(`   Status atual (openedNow): ${horario.openedNow ? '🟢 ABERTO' : '🔴 FECHADO'}`);
  console.log(`   Status com estaAberto(): ${horario.estaAberto() ? '🟢 ABERTO' : '🔴 FECHADO'}`);
  console.log('   📝 Note: openedNow sempre retorna o status atual baseado no timezone\n');

  // 4. Comparação com diferentes métodos
  console.log('📊 4. Comparação de Métodos');
  const agora = new Date();
  const status = {
    openedNow: horario.openedNow,
    estaAbertoAgora: horario.estaAberto(),
    estaAbertoEspecifico: horario.estaAberto(agora),
    proximaAbertura: horario.proximaAbertura(),
    proximoFechamento: horario.proximoFechamento(),
    minutosRestantes: horario.minutosRestantesHoje()
  };

  console.log('   Status completo:');
  console.log(`   - openedNow: ${status.openedNow ? '🟢 ABERTO' : '🔴 FECHADO'}`);
  console.log(`   - estaAberto(): ${status.estaAbertoAgora ? '🟢 ABERTO' : '🔴 FECHADO'}`);
  console.log(`   - estaAberto(agora): ${status.estaAbertoEspecifico ? '🟢 ABERTO' : '🔴 FECHADO'}`);
  
  if (status.proximaAbertura) {
    console.log(`   - Próxima abertura: ${status.proximaAbertura.toLocaleString('pt-BR')}`);
  }
  
  if (status.proximoFechamento) {
    console.log(`   - Próximo fechamento: ${status.proximoFechamento.toLocaleString('pt-BR')}`);
  }
  
  if (status.minutosRestantes > 0) {
    console.log(`   - Minutos restantes: ${status.minutosRestantes} minutos`);
  }

  // 5. Demonstração com diferentes timezones
  console.log('\n🌍 5. Teste com Diferentes Timezones');
  
  const timezones = [
    'America/Sao_Paulo',
    'America/New_York', 
    'Europe/London',
    'Asia/Tokyo'
  ];

  for (const tz of timezones) {
    setTimezone(tz);
    const horarioTz = new HorarioComercial({
      segunda: { abertura: '08:00', fechamento: '18:00' },
      terca: { abertura: '08:00', fechamento: '18:00' },
      quarta: { abertura: '08:00', fechamento: '18:00' },
      quinta: { abertura: '08:00', fechamento: '18:00' },
      sexta: { abertura: '08:00', fechamento: '18:00' }
    });
    
    console.log(`   ${tz}:`);
    console.log(`     Hora: ${getTimeInTimezone()}`);
    console.log(`     Status: ${horarioTz.openedNow ? '🟢 ABERTO' : '🔴 FECHADO'}`);
  }

  // 6. Vantagens da funcionalidade openedNow
  console.log('\n💡 6. Vantagens da Funcionalidade openedNow');
  console.log('   ✅ Sempre atualizado automaticamente');
  console.log('   ✅ Baseado no timezone configurado');
  console.log('   ✅ Não precisa passar parâmetros');
  console.log('   ✅ Ideal para dashboards e status em tempo real');
  console.log('   ✅ Compatível com a API existente');

  console.log('\n🎉 Demonstração concluída!');
}

// Executa a demonstração
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateOpenedNow().catch(console.error);
}

export { demonstrateOpenedNow };
