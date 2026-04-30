require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField,
  EmbedBuilder,
  StringSelectMenuBuilder
} = require('discord.js');

const { createTranscript } = require('discord-html-transcripts');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// 🔐 CONFIG
const CATEGORIA_ID = "1499171154655711262";
const SUPORTE_ID = "1493784454660096141";
const LOGS_ID = "1499141431447650344";

// ✅ BOT ONLINE
client.once("ready", () => {
  console.log(`🤖 Bot online: ${client.user.tag}`);
});

// =====================
// INTERAÇÕES
// =====================
client.on("interactionCreate", async (interaction) => {

  // =====================
  // /ticket (PAINEL)
  // =====================
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "ticket") {

      const embed = new EmbedBuilder()
        .setColor('#7A00FF')
        .setTitle('⚡ LOJINHA ADRENALINA • CONTAS FULL ROXA')
        .setDescription(`
🎮 **Alugue contas full roxas para ganhar AP 🔥**

💰 A partir de **R$2,50**
⚡ Entrega automática
🔐 Contas seguras e verificadas

🚀 Entre, jogue e domine a partida!

💎 **LOJINHA ADRENALINA • Rápido e seguro 🔥**
        `)
        .setThumbnail(interaction.guild.iconURL())
        .setFooter({ text: "Selecione uma opção abaixo 👇" });

      const menu = new StringSelectMenuBuilder()
        .setCustomId('ticket_select')
        .setPlaceholder('Selecione um tipo de atendimento')
        .addOptions([
          {
            label: 'Suporte',
            description: 'Ajuda geral',
            value: 'suporte',
            emoji: '📩'
          },
          {
            label: 'Aluguel',
            description: 'Comprar contas',
            value: 'aluguel',
            emoji: '🛒'
          },
          {
            label: 'Vagas ADM',
            description: 'Entrar na staff',
            value: 'vagas',
            emoji: '👑'
          }
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      return interaction.reply({
        embeds: [embed],
        components: [row]
      });
    }
  }

  // =====================
  // SELECT MENU
  // =====================
  if (interaction.isStringSelectMenu()) {

    if (interaction.customId === 'ticket_select') {

      const tipo = interaction.values[0];

      const nomes = {
        suporte: 'suporte',
        aluguel: 'aluguel',
        vagas: 'vagas-adm'
      };

      const nomeUsuario = interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '');

      const existente = interaction.guild.channels.cache.find(
        c => c.name === `ticket-${nomes[tipo]}-${nomeUsuario}`
      );

      if (existente) {
        return interaction.reply({
          content: "❌ Você já tem um ticket aberto.",
          ephemeral: true
        });
      }

      const canal = await interaction.guild.channels.create({
        name: `ticket-${nomes[tipo]}-${nomeUsuario}`,
        type: ChannelType.GuildText,
        parent: CATEGORIA_ID,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory
            ]
          },
          {
            id: SUPORTE_ID,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory
            ]
          }
        ]
      });

      const botoes = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("assumir_ticket")
          .setLabel("Assumir")
          .setEmoji("👤")
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId("fechar_ticket")
          .setLabel("Fechar")
          .setEmoji("🔒")
          .setStyle(ButtonStyle.Danger)
      );

      const embed = new EmbedBuilder()
        .setColor("#00ff88")
        .setTitle("🎫 Ticket Aberto")
        .addFields(
          { name: "👤 Usuário", value: `${interaction.user}`, inline: true },
          { name: "📂 Tipo", value: nomes[tipo], inline: true }
        )
        .setDescription("Descreva seu problema e aguarde o suporte.")
        .setFooter({ text: "Equipe Adrenalina 🚀" });

      await canal.send({
        content: `<@${interaction.user.id}> <@&${SUPORTE_ID}>`,
        embeds: [embed],
        components: [botoes]
      });

      return interaction.reply({
        content: "✅ Ticket criado com sucesso!",
        ephemeral: true
      });
    }
  }

  // =====================
  // BOTÕES
  // =====================
  if (interaction.isButton()) {

    // 👤 ASSUMIR
    if (interaction.customId === "assumir_ticket") {

      if (!interaction.member.roles.cache.has(SUPORTE_ID)) {
        return interaction.reply({
          content: "❌ Apenas suporte pode assumir.",
          ephemeral: true
        });
      }

      return interaction.reply({
        content: `👤 Ticket assumido por ${interaction.user}`
      });
    }

    // 🔒 FECHAR
    if (interaction.customId === "fechar_ticket") {

      if (!interaction.member.roles.cache.has(SUPORTE_ID)) {
        return interaction.reply({
          content: "❌ Apenas suporte pode fechar.",
          ephemeral: true
        });
      }

      await interaction.reply({
        content: "🔒 Fechando ticket...",
        ephemeral: true
      });

      setTimeout(async () => {

        const transcript = await createTranscript(interaction.channel, {
          limit: -1,
          returnType: "buffer"
        });

        const logs = interaction.guild.channels.cache.get(LOGS_ID);

        if (logs) {
          await logs.send({
            embeds: [
              new EmbedBuilder()
                .setTitle("📁 Ticket Fechado")
                .addFields(
                  { name: "Canal", value: `${interaction.channel.name}` },
                  { name: "Fechado por", value: `${interaction.user}` }
                )
                .setColor("Red")
            ],
            files: [{
              attachment: transcript,
              name: `ticket-${interaction.channel.name}.html`
            }]
          });
        }

        await interaction.channel.delete();

      }, 2000);
    }
  }
});

client.login(process.env.TOKEN);