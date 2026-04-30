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

// 📂 CATEGORIA ONDE VÃO FICAR AS COMPRAS
const CATEGORIA_COMPRAS = "1499171491688874024";

// ✅ BOT ONLINE
client.once("ready", () => {
  console.log(`🤖 Bot online: ${client.user.tag}`);
});

// =====================
client.on("interactionCreate", async (interaction) => {

  // =====================
  // 🛒 BOTÃO DE COMPRA
  // =====================
  if (interaction.isButton()) {

    if (interaction.customId.startsWith("comprar_")) {

      const produto = interaction.customId.split("_")[1];
      const user = interaction.user;

      // cria canal privado
      const canal = await interaction.guild.channels.create({
        name: `🛒-${user.username}`,
        type: ChannelType.GuildText,
        parent: CATEGORIA_COMPRAS,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },
          {
            id: user.id,
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

      // embed estilo loja
      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("🧾 Revisão do Pedido")
        .addFields(
          { name: "📦 Produto", value: produto, inline: true },
          { name: "💰 Preço", value: "R$20", inline: true },
          { name: "📦 Estoque", value: "1", inline: true }
        )
        .setFooter({ text: "Finalize seu pedido abaixo 👇" });

      const botoes = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("pagar")
          .setLabel("Pagar")
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId("cancelar")
          .setLabel("Cancelar")
          .setStyle(ButtonStyle.Danger)
      );

      await canal.send({
        content: `<@${user.id}>`,
        embeds: [embed],
        components: [botoes]
      });

      return interaction.reply({
        content: "🛒 Pedido criado!",
        ephemeral: true
      });
    }

    // =====================
    // ❌ CANCELAR COMPRA
    // =====================
    if (interaction.customId === "cancelar") {
      return interaction.channel.delete();
    }

    // =====================
    // 💰 PAGAR (placeholder)
    // =====================
    if (interaction.customId === "pagar") {
      return interaction.reply({
        content: "💰 Aqui você pode integrar pagamento (PIX, etc)",
        ephemeral: true
      });
    }
  }
});

// =====================
// 📦 COMANDO PARA CRIAR PAINEL DE PRODUTO
// =====================
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // comando simples: .painel
  if (message.content === ".painel") {

    if (!message.member.roles.cache.has(SUPORTE_ID)) return;

    const embed = new EmbedBuilder()
      .setColor("#7A00FF")
      .setTitle("🔥 CONTA FULL ROXA")
      .setDescription(`
💎 Conta completa pronta pra uso

💰 **Preço:** R$20
📦 **Estoque:** 1
      `);

    const botao = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("comprar_fullroxa")
        .setLabel("Comprar")
        .setEmoji("🛒")
        .setStyle(ButtonStyle.Primary)
    );

    message.channel.send({
      embeds: [embed],
      components: [botao]
    });
  }
});

client.login(process.env.TOKEN);