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
const CATEGORIA_COMPRAS = "1499171491688874024";

// ✅ BOT ONLINE
client.once("ready", () => {
  console.log(`🤖 Bot online: ${client.user.tag}`);
});

// =====================
// 🔘 INTERAÇÕES
// =====================
client.on("interactionCreate", async (interaction) => {

  // =====================
  // 🛒 MENU (ESCOLHER PRODUTO)
  // =====================
  if (interaction.isStringSelectMenu()) {

    if (interaction.customId === "selecionar_produto") {

      const escolha = interaction.values[0];
      const user = interaction.user;

      // 🚫 evitar duplicado
      const existente = interaction.guild.channels.cache.find(c =>
        c.name === `🛒-${user.username.toLowerCase()}`
      );

      if (existente) {
        return interaction.reply({
          content: "❌ Você já tem um pedido aberto.",
          ephemeral: true
        });
      }

      let produto = "";
      let preco = "";

      if (escolha === "plano1") {
        produto = "Bugadão 09h até 21h";
        preco = "R$20";
      }

      if (escolha === "plano2") {
        produto = "Bugadão 21h até 09h";
        preco = "R$20";
      }

      if (escolha === "plano3") {
        produto = "Bugadão 24h";
        preco = "R$38";
      }

      const canal = await interaction.guild.channels.create({
        name: `🛒-${user.username.toLowerCase()}`,
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

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("🧾 Revisão do Pedido")
        .addFields(
          { name: "📦 Produto", value: produto, inline: true },
          { name: "💰 Preço", value: preco, inline: true },
          { name: "📦 Estoque", value: "1", inline: true }
        )
        .setFooter({ text: "Finalize abaixo 👇" });

      const botoes = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("pagar")
          .setLabel("Ir para pagamento")
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
        content: "✅ Pedido criado!",
        ephemeral: true
      });
    }
  }

  // =====================
  // 🔘 BOTÕES
  // =====================
  if (!interaction.isButton()) return;

  if (interaction.customId === "cancelar") {
    return interaction.channel.delete().catch(() => {});
  }

  if (interaction.customId === "pagar") {
    return interaction.reply({
      content: "💰 Aqui você pode integrar PIX depois",
      ephemeral: true
    });
  }
});

// =====================
// 📦 COMANDO .PAINEL
// =====================
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === ".painel") {

    if (!message.member.roles.cache.has(SUPORTE_ID)) return;

    const embed = new EmbedBuilder()
      .setColor("#7A00FF")
      .setTitle("🔥 CONTA FULL ROXA")
      .setDescription(`
💎 Conta pronta pra uso

📦 Escolha uma opção abaixo 👇
      `);

    const menu = new StringSelectMenuBuilder()
      .setCustomId("selecionar_produto")
      .setPlaceholder("Selecione o plano")
      .addOptions([
        {
          label: "Bugadão 09h até 21h",
          description: "R$20 | Estoque: 1",
          value: "plano1"
        },
        {
          label: "Bugadão 21h até 09h",
          description: "R$20 | Estoque: 1",
          value: "plano2"
        },
        {
          label: "Bugadão 24h",
          description: "R$38 | Estoque: 1",
          value: "plano3"
        }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    await message.channel.send({
      embeds: [embed],
      components: [row]
    });

    // 🧹 apaga comando
    await message.delete().catch(() => {});
  }
});

client.login(process.env.TOKEN);