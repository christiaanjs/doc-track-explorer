using DocTrackExplorer.Services;

var builder = WebApplication.CreateBuilder(args);

// Configure environment-specific CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
            builder.Environment.IsDevelopment() 
                ? "http://localhost:5173" 
                : "https://doc-track-explorer.onrender.com"
        )
        .AllowAnyMethod()
        .AllowAnyHeader();
    });
});

// Add services
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

builder.Services.AddHttpClient<DocTrackService>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
