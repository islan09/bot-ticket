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
client.on("interactionCreate", async (interaction) => {

  // 🎫 COMANDO /ticket
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "ticket") {

      const embed = new EmbedBuilder()
        .setColor('#7A00FF')
        .setTitle('⚡ LOJINHA ADRENALINA • CONTAS FULL ROXA')
        .setDescription(`
🎮 Alugue contas full roxas para ganhar ap 🔥 

💰 A partir de R$2,50
⚡ Entrega automática
🔐 Contas seguras e verificadas

🚀 Entre, jogue e domine a partida!

💎 LOJINHA ADRENALINA • Rápido e seguro 🔥
        `);

      const menu = new StringSelectMenuBuilder()
        .setCustomId('ticket_select')
        .setPlaceholder('Selecione um tipo de atendimento')
        .addOptions([
          {
            label: 'Suporte',
            description: 'Suporte para aluguel de contas',
            value: 'suporte',
            emoji: '📩'
          },
          {
            label: 'Aluguel',
            description: 'Alugue suas contas',
            value: 'aluguel',
            emoji: '🛒'
          },
          {
            label: 'Vagas ADM',
            description: 'Candidatura para staff',
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
  // 🎫 CRIAR TICKET
  if (interaction.isStringSelectMenu()) {

    if (interaction.customId === 'ticket_select') {

      const tipo = interaction.values[0];

      const nomeUser = interaction.user.username
        .toLowerCase()
        .replace(/[^a-z0-9]/gi, '');

      // 🔒 BLOQUEIA QUALQUER TICKET JÁ ABERTO
      const existente = interaction.guild.channels.cache.find(
        c => c.name.includes(nomeUser)
      );

      if (existente) {
        return interaction.reply({
          content: "❌ Você já tem um ticket aberto.",
          ephemeral: true
        });
      }

      const canal = await interaction.guild.channels.create({
        name: `${tipo}-${nomeUser}`,
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

      const row = new ActionRowBuilder().addComponents(
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
        .setTitle(`🎫 Ticket - ${tipo}`)
        .setDescription(`👋 Olá ${interaction.user}

Explique seu problema e aguarde atendimento.`)
        .setColor("Green");

      await canal.send({
        content: `<@${interaction.user.id}> <@&${SUPORTE_ID}>`,
        embeds: [embed],
        components: [row]
      });

      return interaction.reply({
        content: "✅ Ticket criado com sucesso!",
        ephemeral: true
      });
    }
  }

  // =====================
  // 🔘 BOTÕES
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
        content: "🔒 Gerando transcript...",
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
                .setDescription(`Canal: ${interaction.channel.name}`)
                .addFields({ name: "Fechado por", value: `${interaction.user}` })
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