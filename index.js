require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField,
  EmbedBuilder
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

// 🔐 CONFIGURAÇÃO
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
  // COMANDO /TICKET
  // =====================
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "ticket") {

      const painel = new EmbedBuilder()
        .setTitle("🎫 Central de Suporte")
        .setDescription(
          "Clique no botão abaixo para abrir um ticket.\n\n" +
          "📌 Nosso suporte irá te atender o mais rápido possível."
        )
        .setColor("#2b2d31")
        .setThumbnail(interaction.guild.iconURL())
        .setFooter({ text: "Sistema de Tickets" });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("abrir_ticket")
          .setLabel("Abrir Ticket")
          .setEmoji("🎫")
          .setStyle(ButtonStyle.Success)
      );

      return interaction.reply({
        embeds: [painel],
        components: [row]
      });
    }
  }

  // =====================
  // BOTÕES
  // =====================
  if (interaction.isButton()) {

    // 🎫 ABRIR TICKET
    if (interaction.customId === "abrir_ticket") {

      const existente = interaction.guild.channels.cache.find(
        c => c.name === `ticket-${interaction.user.id}`
      );

      if (existente) {
        return interaction.reply({
          content: "❌ Você já tem um ticket aberto.",
          ephemeral: true
        });
      }

      const canal = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.id}`,
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
        .setTitle("🎫 Ticket Aberto")
        .setDescription("Explique seu problema e aguarde atendimento.")
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

    // 👤 ASSUMIR TICKET
    if (interaction.customId === "assumir_ticket") {

      if (!interaction.member.roles.cache.has(SUPORTE_ID)) {
        return interaction.reply({
          content: "❌ Apenas suporte pode assumir tickets.",
          ephemeral: true
        });
      }

      return interaction.reply({
        content: `👤 Ticket assumido por ${interaction.user}`
      });
    }

    // 🔒 FECHAR TICKET
    if (interaction.customId === "fechar_ticket") {

      if (!interaction.member.roles.cache.has(SUPORTE_ID)) {
        return interaction.reply({
          content: "❌ Apenas suporte pode fechar tickets.",
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
                .addFields(
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