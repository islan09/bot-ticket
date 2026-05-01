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
const SUPORTE_ID = "1493784454660096141";
const LOGS_ID = "1499141431447650344";
const FEEDBACK_CHANNEL_ID = "1499501012845592586";

// 📂 CATEGORIAS
const CATEGORIAS = {
  suporte: "1499171154655711262",
  aluguel: "1499171154655711262",
  vagas: "1499171154655711262"
};

// ✅ BOT ONLINE
client.once("ready", () => {
  console.log(`🤖 Bot online: ${client.user.tag}`);
});

// =====================
// 📌 COMANDOS
// =====================
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // 🎫 PAINEL
  if (message.content === ".ticket") {

    const embed = new EmbedBuilder()
      .setColor('#7A00FF')
      .setTitle('⚡HD STORE • CONTAS FULL ROXA')
      .setDescription(`
🎮 **Alugue contas full roxas para ganhar AP 🔥**

💰 A partir de **R$2,50**
⚡ Entrega automática
🔐 Contas seguras e verificadas

🚀 Entre, jogue e domine a partida!

💎 **HD STORE • Rápido e seguro 🔥**
      `)
      .setThumbnail(message.guild.iconURL())
      .setFooter({ text: "Selecione uma opção abaixo 👇" });

    const menu = new StringSelectMenuBuilder()
      .setCustomId('ticket_select')
      .setPlaceholder('Selecione um tipo de atendimento')
      .addOptions([
        { label: 'Suporte', value: 'suporte', emoji: '📩' },
        { label: 'Aluguel', value: 'aluguel', emoji: '🛒' },
        { label: 'Vagas ADM', value: 'vagas', emoji: '👑' }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    await message.channel.send({
      embeds: [embed],
      components: [row]
    });

    await message.delete().catch(() => {});
  }

  // 🔥 RENOMEAR
  if (message.content.startsWith(".r")) {

    if (!message.member.roles.cache.has(SUPORTE_ID)) return;

    const args = message.content.split(" ").slice(1);
    if (args.length < 1) return;

    const nome = args.join("-")
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '');

    try {
      await message.channel.setName(nome);
      await message.delete().catch(() => {});
    } catch (err) {
      console.error(err);
    }
  }

  // ⭐ FEEDBACK
  if (message.content.startsWith(".feedback")) {

    const args = message.content.split(" ").slice(1);
    if (args.length < 2) return;

    const estrelas = parseInt(args[0]);
    const texto = args.slice(1).join(" ");

    if (isNaN(estrelas) || estrelas < 1 || estrelas > 5) return;

    const estrelasVisual = "⭐".repeat(estrelas);

    const embed = new EmbedBuilder()
      .setColor("Gold")
      .setTitle("⭐ Novo Feedback")
      .addFields(
        { name: "👤 Cliente", value: `${message.author}`, inline: true },
        { name: "⭐ Avaliação", value: estrelasVisual, inline: true }
      )
      .setDescription(`💬 ${texto}`)
      .setFooter({ text: "HD STORE 🚀" })
      .setTimestamp();

    const canal = message.guild.channels.cache.get(FEEDBACK_CHANNEL_ID);

    if (canal) {
      canal.send({ embeds: [embed] });
    } else {
      console.log("Canal de feedback não encontrado");
    }

    await message.delete().catch(() => {});
  }

});

// =====================
// 🎫 INTERAÇÕES
// =====================
client.on("interactionCreate", async (interaction) => {

  // MENU
  if (interaction.isStringSelectMenu()) {

    await interaction.deferReply({ ephemeral: true });

    if (interaction.customId === 'ticket_select') {

      const tipo = interaction.values[0];

      const nomeUsuario = interaction.user.username
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

      const existente = interaction.guild.channels.cache.find(
        c => c.name === `${tipo}-${nomeUsuario}`
      );

      if (existente) {
        return interaction.editReply({
          content: "❌ Você já tem um ticket aberto."
        });
      }

      const canal = await interaction.guild.channels.create({
        name: `${tipo}-${nomeUsuario}`,
        type: ChannelType.GuildText,
        parent: CATEGORIAS[tipo],
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages
            ]
          },
          {
            id: SUPORTE_ID,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages
            ]
          }
        ]
      });

      // 🔥 EMBED DO TICKET (VOLTOU)
      const embed = new EmbedBuilder()
        .setColor("#2f3136")
        .setTitle(`🎫 Ticket ${tipo.toUpperCase()}`)
        .setDescription("Explique seu pedido e aguarde atendimento.")
        .setFooter({ text: "HD STORE 🚀" });

      const botoes = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("assumir_ticket")
          .setLabel("Assumir")
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId("fechar_ticket")
          .setLabel("Fechar")
          .setStyle(ButtonStyle.Danger)
      );

      await canal.send({
        content: `<@${interaction.user.id}> <@&${SUPORTE_ID}>`,
        embeds: [embed],
        components: [botoes]
      });

      return interaction.editReply({
        content: "✅ Ticket criado!"
      });
    }
  }

  // BOTÕES
  if (interaction.isButton()) {

    // 👤 ASSUMIR
    if (interaction.customId === "assumir_ticket") {

      await interaction.deferUpdate(); // 🔥 corrige erro

      if (!interaction.member.roles.cache.has(SUPORTE_ID)) return;

      const newRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("assumido")
          .setLabel(`Assumido por ${interaction.user.username}`)
          .setStyle(ButtonStyle.Success)
          .setDisabled(true),

        new ButtonBuilder()
          .setCustomId("fechar_ticket")
          .setLabel("Fechar")
          .setStyle(ButtonStyle.Danger)
      );

      await interaction.message.edit({ components: [newRow] });
    }

    // 🔒 FECHAR
    if (interaction.customId === "fechar_ticket") {

      if (!interaction.member.roles.cache.has(SUPORTE_ID)) return;

      await interaction.reply({
        content: "🔒 Fechando...",
        ephemeral: true
      });

      setTimeout(async () => {

        const transcript = await createTranscript(interaction.channel, {
          limit: -1,
          returnType: "buffer"
        });

        const logs = interaction.guild.channels.cache.get(LOGS_ID);

        if (logs) {
          logs.send({
            files: [{
              attachment: transcript,
              name: `ticket.html`
            }]
          });
        }

        interaction.channel.delete();

      }, 2000);
    }
  }
});

client.login(process.env.TOKEN);